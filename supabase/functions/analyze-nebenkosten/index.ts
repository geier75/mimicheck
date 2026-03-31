// Edge Function: Nebenkostenabrechnung analysieren
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Nicht authentifiziert')

    // Get abrechnung data
    const { abrechnungId } = await req.json()

    if (!abrechnungId) {
      throw new Error('abrechnungId fehlt')
    }

    // Get abrechnung from database
    const { data: abrechnung, error: abrechnungError } = await supabaseClient
      .from('abrechnungen')
      .select('*')
      .eq('id', abrechnungId)
      .eq('user_id', user.id)
      .single()

    if (abrechnungError) throw new Error('Abrechnung nicht gefunden')

    // Analyze
    const analysis = analyzeAbrechnung(abrechnung)

    // Save analysis results
    const { error: updateError } = await supabaseClient
      .from('abrechnungen')
      .update({
        analysis_result: analysis,
        analyzed_at: new Date().toISOString()
      })
      .eq('id', abrechnungId)

    if (updateError) throw new Error('Speichern fehlgeschlagen')

    return new Response(
      JSON.stringify({
        success: true,
        analysis
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function analyzeAbrechnung(abrechnung: any) {
  const errors: any[] = []
  const warnings: any[] = []
  let potentialSavings = 0

  // Prüfe Heizkosten
  if (abrechnung.heizkosten) {
    const heizkostenProQm = abrechnung.heizkosten / abrechnung.wohnflaeche_qm
    
    if (heizkostenProQm > 15) {
      errors.push({
        category: 'Heizkosten',
        message: 'Heizkosten zu hoch',
        details: `${heizkostenProQm.toFixed(2)}€/qm (Normal: 10-15€/qm)`,
        potentialSaving: (heizkostenProQm - 12) * abrechnung.wohnflaeche_qm
      })
      potentialSavings += (heizkostenProQm - 12) * abrechnung.wohnflaeche_qm
    }
  }

  // Prüfe Wasserkosten
  if (abrechnung.wasserkosten) {
    const wasserkostenProPerson = abrechnung.wasserkosten / abrechnung.personen_anzahl
    
    if (wasserkostenProPerson > 300) {
      warnings.push({
        category: 'Wasserkosten',
        message: 'Wasserkosten erhöht',
        details: `${wasserkostenProPerson.toFixed(2)}€/Person (Normal: 200-250€)`,
        potentialSaving: (wasserkostenProPerson - 225) * abrechnung.personen_anzahl
      })
      potentialSavings += (wasserkostenProPerson - 225) * abrechnung.personen_anzahl
    }
  }

  // Prüfe Müllgebühren
  if (abrechnung.muellgebuehren) {
    const muellProQm = abrechnung.muellgebuehren / abrechnung.wohnflaeche_qm
    
    if (muellProQm > 3) {
      warnings.push({
        category: 'Müllgebühren',
        message: 'Müllgebühren überhöht',
        details: `${muellProQm.toFixed(2)}€/qm (Normal: 1-2€/qm)`,
        potentialSaving: (muellProQm - 1.5) * abrechnung.wohnflaeche_qm
      })
      potentialSavings += (muellProQm - 1.5) * abrechnung.wohnflaeche_qm
    }
  }

  // Prüfe Hausmeister
  if (abrechnung.hausmeister_kosten) {
    const hausmeisterProQm = abrechnung.hausmeister_kosten / abrechnung.wohnflaeche_qm
    
    if (hausmeisterProQm > 2) {
      warnings.push({
        category: 'Hausmeister',
        message: 'Hausmeisterkosten zu hoch',
        details: `${hausmeisterProQm.toFixed(2)}€/qm (Normal: 0.5-1.5€/qm)`,
        potentialSaving: (hausmeisterProQm - 1) * abrechnung.wohnflaeche_qm
      })
      potentialSavings += (hausmeisterProQm - 1) * abrechnung.wohnflaeche_qm
    }
  }

  // Prüfe Versicherungen
  if (abrechnung.versicherungen) {
    const versicherungProQm = abrechnung.versicherungen / abrechnung.wohnflaeche_qm
    
    if (versicherungProQm > 1.5) {
      warnings.push({
        category: 'Versicherungen',
        message: 'Versicherungskosten erhöht',
        details: `${versicherungProQm.toFixed(2)}€/qm (Normal: 0.5-1€/qm)`,
        potentialSaving: (versicherungProQm - 0.75) * abrechnung.wohnflaeche_qm
      })
      potentialSavings += (versicherungProQm - 0.75) * abrechnung.wohnflaeche_qm
    }
  }

  return {
    errors,
    warnings,
    potentialSavings: Math.round(potentialSavings),
    totalIssues: errors.length + warnings.length,
    status: errors.length > 0 ? 'critical' : warnings.length > 0 ? 'warning' : 'ok',
    recommendation: errors.length > 0 
      ? 'Widerspruch empfohlen - Fehler gefunden'
      : warnings.length > 0
      ? 'Prüfung empfohlen - Auffälligkeiten gefunden'
      : 'Abrechnung erscheint korrekt'
  }
}
