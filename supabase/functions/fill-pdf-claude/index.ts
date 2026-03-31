import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FillPdfRequest {
  pdfUrl: string
  formType: string
  userProfile: any
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { pdfUrl, formType, userProfile }: FillPdfRequest = await req.json()
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY')

    if (!claudeApiKey) {
      throw new Error('CLAUDE_API_KEY nicht konfiguriert')
    }

    // Supabase Client für Auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // User authentifizieren
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Nicht authentifiziert')
    }

    console.log('Fülle PDF für User:', user.id, 'FormType:', formType)

    // 1. Claude API aufrufen für intelligentes Mapping
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
          content: `Du bist ein KI-Assistent für deutsche Behördenformulare.

**Antragstyp**: ${formType}

**Nutzerprofil**:
${JSON.stringify(userProfile, null, 2)}

**Aufgabe**:
Erstelle ein intelligentes Mapping für das ${formType}-Formular. Gib mir eine JSON-Struktur zurück mit Vorschlägen für jedes Formularfeld:

{
  "suggestions": [
    {
      "fieldName": string (technischer Feldname),
      "displayName": string (deutscher Feldname),
      "suggestedValue": any (Wert aus Profil),
      "confidence": number (0-1),
      "source": string (woher der Wert kommt),
      "note": string (optional: Hinweis für User)
    }
  ],
  "missingFields": [
    {
      "fieldName": string,
      "displayName": string,
      "description": string,
      "required": boolean
    }
  ],
  "warnings": string[] (wichtige Hinweise)
}

**Wichtige Felder für ${formType}**:
- Vorname, Nachname
- Geburtsdatum
- Adresse (Straße, PLZ, Ort)
- Einkommen
${formType === 'wohngeld' ? '- Miete (kalt)\n- Wohnfläche in qm' : ''}
${formType === 'buergergeld' ? '- Vermögen\n- Haushaltsgröße' : ''}

Antworte NUR mit validem JSON, ohne zusätzlichen Text.`
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
    let mappingResult
    try {
      mappingResult = JSON.parse(content)
    } catch (e) {
      console.error('JSON Parse Error:', e)
      mappingResult = {
        suggestions: [],
        missingFields: [],
        warnings: ['Claude konnte kein valides JSON erstellen'],
        rawResponse: content
      }
    }

    // 2. In Production: PDF tatsächlich mit pdf-lib oder ähnlichem ausfüllen
    // Hier: Simuliere Ergebnis
    const filledFields = mappingResult.suggestions?.length || 0
    const totalFields = filledFields + (mappingResult.missingFields?.length || 0)
    const skippedFields = mappingResult.missingFields?.length || 0

    return new Response(
      JSON.stringify({
        success: true,
        mapping: mappingResult,
        stats: {
          filledFields,
          skippedFields,
          totalFields,
          completeness: totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
        },
        message: 'Formular-Mapping erfolgreich erstellt. PDF-Ausfüllung erfordert pdf-lib Integration.'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'x-filled-fields': filledFields.toString(),
          'x-skipped-fields': skippedFields.toString()
        },
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
