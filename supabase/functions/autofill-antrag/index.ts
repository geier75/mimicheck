// Edge Function: Antrag automatisch ausfüllen
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

    // Get request body
    const { antragId } = await req.json()

    if (!antragId) {
      throw new Error('antragId fehlt')
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    if (profileError) throw new Error('Profil nicht gefunden')

    // Get template
    const { data: template, error: templateError } = await supabaseClient
      .from('antrag_templates')
      .select('*')
      .eq('antrag_id', antragId)
      .single()

    if (templateError) throw new Error('Template nicht gefunden')

    // Fill data
    const filledData: any = {}
    const missingFields: string[] = []

    const fieldMapping: any = {
      'vorname': profile.vorname,
      'nachname': profile.nachname,
      'geburtsdatum': profile.geburtsdatum,
      'strasse': profile.adresse?.split(' ')[0],
      'hausnummer': profile.adresse?.split(' ')[1],
      'plz': profile.plz,
      'ort': profile.stadt,
      'monatliche_miete': profile.monatliche_miete_kalt,
      'wohnflaeche': profile.wohnflaeche_qm,
      'haushalt_groesse': profile.haushalt_groesse,
      'monatliches_einkommen': profile.monatliches_nettoeinkommen,
      'kinder_anzahl': profile.kinder_anzahl,
      'beschaeftigungsstatus': profile.beschaeftigungsstatus,
      'steuer_id': profile.steuer_id,
      'email': profile.email,
      'telefon': profile.telefon
    }

    // Fill fields
    for (const field of template.fields) {
      if (fieldMapping[field.id]) {
        filledData[field.id] = fieldMapping[field.id]
      } else if (field.required) {
        missingFields.push(field.label)
      }
    }

    const completeness = Math.round(
      (Object.keys(filledData).length / template.fields.length) * 100
    )

    // Save to database
    const { data: savedAntrag, error: saveError } = await supabaseClient
      .from('antraege')
      .insert({
        user_id: user.id,
        antrag_id: antragId,
        antrag_name: template.name,
        antrag_category: template.category,
        filled_data: filledData,
        status: 'draft',
        estimated_amount: template.estimated_amount,
        eligibility_score: completeness
      })
      .select()
      .single()

    if (saveError) throw new Error('Speichern fehlgeschlagen')

    return new Response(
      JSON.stringify({
        success: true,
        antrag: {
          ...template,
          filledData,
          missingFields,
          completeness,
          savedId: savedAntrag.id
        }
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
