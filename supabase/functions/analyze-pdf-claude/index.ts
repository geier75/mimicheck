import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyzePdfRequest {
  pdfUrl: string
  formType?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { pdfUrl, formType = 'buergergeld' }: AnalyzePdfRequest = await req.json()
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY')

    if (!claudeApiKey) {
      throw new Error('CLAUDE_API_KEY nicht konfiguriert')
    }

    // 1. PDF-Text extrahieren (vereinfacht - in Production mit PDF-Parser)
    console.log('Analysiere PDF:', pdfUrl)

    // 2. Claude API aufrufen für Feld-Analyse
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `Analysiere dieses ${formType}-Formular PDF und gib mir eine JSON-Struktur zurück mit:
          
{
  "hasFormFields": boolean,
  "fieldCount": number,
  "fields": [
    {
      "fieldName": string,
      "fieldType": "text" | "date" | "number" | "checkbox" | "select",
      "required": boolean,
      "description": string
    }
  ],
  "suggestions": [
    {
      "fieldName": string,
      "expectedDataType": string,
      "hint": string
    }
  ]
}

Antworte NUR mit validen JSON, ohne zusätzlichen Text.`
        }]
      })
    })

    if (!claudeResponse.ok) {
      const error = await claudeResponse.text()
      throw new Error(`Claude API Fehler: ${error}`)
    }

    const claudeData = await claudeResponse.json()
    const content = claudeData.content[0].text

    // Parse Claude's JSON response
    let analysisResult
    try {
      analysisResult = JSON.parse(content)
    } catch (e) {
      // Fallback wenn Claude nicht perfektes JSON liefert
      analysisResult = {
        hasFormFields: false,
        fieldCount: 0,
        warning: 'PDF konnte nicht analysiert werden',
        rawResponse: content
      }
    }

    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Fehler:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
