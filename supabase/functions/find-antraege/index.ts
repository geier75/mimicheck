// Edge Function: Anträge finden basierend auf User-Profil
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserProfile {
  vorname?: string
  nachname?: string
  geburtsdatum?: string
  monatliches_nettoeinkommen?: number
  monatliche_miete_kalt?: number
  wohnart?: string
  kinder_anzahl?: number
  beschaeftigungsstatus?: string
  haushalt_groesse?: number
  wohnflaeche_qm?: number
  alter?: number
}

interface AntragTemplate {
  antrag_id: string
  name: string
  category: string
  description: string
  fields: any[]
  eligibility_criteria: any
  estimated_amount: number
  processing_time: string
  authority: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Nicht authentifiziert')
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    if (profileError) {
      throw new Error('Profil nicht gefunden')
    }

    // Get all active templates
    const { data: templates, error: templatesError } = await supabaseClient
      .from('antrag_templates')
      .select('*')
      .eq('is_active', true)

    if (templatesError) {
      throw new Error('Templates nicht gefunden')
    }

    // Check eligibility for each template
    const eligibleAntraege = []

    for (const template of templates as AntragTemplate[]) {
      const eligibility = checkEligibility(profile, template)
      
      if (eligibility.eligible) {
        eligibleAntraege.push({
          ...template,
          eligibilityScore: eligibility.score,
          reasoning: eligibility.reasoning,
          missingData: eligibility.missingData
        })
      }
    }

    // Sort by score
    eligibleAntraege.sort((a, b) => b.eligibilityScore - a.eligibilityScore)

    return new Response(
      JSON.stringify({
        success: true,
        antraege: eligibleAntraege,
        totalFound: eligibleAntraege.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
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

function checkEligibility(profile: any, template: AntragTemplate) {
  const criteria = template.eligibility_criteria
  let score = 0
  let reasoning: string[] = []
  let missingData: string[] = []

  // Wohngeld
  if (template.antrag_id === 'wohngeld') {
    if (!profile.monatliches_nettoeinkommen) {
      missingData.push('Monatliches Einkommen')
      score = 50
    } else if (profile.monatliches_nettoeinkommen <= criteria.maxEinkommen) {
      score += 40
      reasoning.push(`Einkommen (${profile.monatliches_nettoeinkommen}€) unter Grenze`)
    }

    if (!profile.monatliche_miete_kalt) {
      missingData.push('Monatliche Miete')
    } else if (
      profile.monatliche_miete_kalt >= criteria.minMiete &&
      profile.monatliche_miete_kalt <= criteria.maxMiete
    ) {
      score += 30
      reasoning.push(`Miete (${profile.monatliche_miete_kalt}€) förderfähig`)
    }

    if (profile.wohnart === 'miete') {
      score += 30
      reasoning.push('Wohnt zur Miete')
    }
  }

  // Kindergeld
  if (template.antrag_id === 'kindergeld') {
    if (!profile.kinder_anzahl) {
      missingData.push('Anzahl Kinder')
      score = 50
    } else if (profile.kinder_anzahl > 0) {
      score = 100
      reasoning.push(`${profile.kinder_anzahl} Kind(er) - Anspruch`)
    } else {
      score = 0
      reasoning.push('Keine Kinder')
    }
  }

  // Bürgergeld
  if (template.antrag_id === 'buergergeld') {
    if (!profile.monatliches_nettoeinkommen) {
      missingData.push('Monatliches Einkommen')
      score = 50
    } else if (profile.monatliches_nettoeinkommen <= criteria.maxEinkommen) {
      score += 50
      reasoning.push('Einkommen unter Grenze')
    }

    if (profile.beschaeftigungsstatus === 'arbeitslos') {
      score += 50
      reasoning.push('Arbeitslos gemeldet')
    }
  }

  // BAföG
  if (template.antrag_id === 'bafoeg') {
    if (profile.beschaeftigungsstatus === 'student') {
      score += 60
      reasoning.push('Student/in')
    } else {
      score = 0
      reasoning.push('Kein Student')
    }

    if (profile.alter && profile.alter < 30) {
      score += 40
      reasoning.push('Unter 30 Jahre')
    }
  }

  return {
    eligible: score >= 50,
    score,
    reasoning: reasoning.join(', '),
    missingData
  }
}
