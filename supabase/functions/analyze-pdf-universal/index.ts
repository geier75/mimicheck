import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { pdfText, pdfUrl } = await req.json()

        if (!pdfText && !pdfUrl) {
            throw new Error('PDF text or URL is required')
        }

        // Use Anthropic Claude 3.5 Sonnet for superior document understanding
        const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
        if (!ANTHROPIC_API_KEY) {
            throw new Error('Anthropic API Key not configured')
        }

        const prompt = `
      Du bist ein Experte für deutsche Bürokratie-Formulare.
      Analysiere den folgenden Text aus einem PDF-Formular.
      
      Identifiziere alle ausfüllbaren Felder und deren Kontext.
      Erstelle ein JSON-Schema, das beschreibt, welche Daten benötigt werden.
      
      PDF Inhalt (Auszug):
      ${pdfText ? pdfText.substring(0, 4000) : 'PDF URL provided: ' + pdfUrl}
      
      Gib NUR valides JSON zurück:
      {
        "documentType": "string (z.B. Wohngeldantrag)",
        "fields": [
          {
            "id": "string (technische ID oder Label)",
            "label": "string (was steht im Formular)",
            "type": "text|date|checkbox|number",
            "required": boolean,
            "context": "string (Erklärung)"
          }
        ],
        "complexity": "low|medium|high"
      }
    `

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt }],
            }),
        })

        const aiData = await response.json()

        if (aiData.error) {
            throw new Error(`Anthropic Error: ${aiData.error.message}`)
        }

        const analysis = JSON.parse(aiData.content[0].text)

        return new Response(
            JSON.stringify({ analysis }),
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
