import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userProfile } = await req.json()

    // 1. Validate Input
    if (!userProfile) {
      throw new Error('User profile is required')
    }

    // 2. AI Analysis (Using OpenAI GPT-4o)
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API Key not configured')
    }

    const prompt = `
      Analysiere die folgende Lebenssituation für Sozialleistungen in Deutschland (Wohngeld, Kindergeld, Bürgergeld, etc.).
      
      Profil:
      ${JSON.stringify(userProfile, null, 2)}
      
      Gib das Ergebnis als valides JSON zurück mit folgender Struktur:
      {
        "estimatedTotalMonthlyBenefit": number,
        "eligiblePrograms": [
          {
            "programName": string,
            "eligibilityScore": number (0-100),
            "estimatedAmount": number,
            "reasoning": string,
            "requiredDocuments": string[],
            "nextSteps": string[],
            "officialLink": string
          }
        ],
        "recommendations": string[]
      }
      
      Sei präzise, aber optimistisch. Schätze Beträge realistisch basierend auf aktuellen deutschen Gesetzen (2025).
    `

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Du bist ein Experte für deutsche Sozialleistungen und Bürokratie.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    })

    const aiData = await response.json()

    if (aiData.error) {
      throw new Error(`OpenAI Error: ${aiData.error.message}`)
    }

    const analysisResult = JSON.parse(aiData.choices[0].message.content.replace(/```json|```/g, ''))

    // 3. Return Result
    return new Response(
      JSON.stringify({ analysis: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
