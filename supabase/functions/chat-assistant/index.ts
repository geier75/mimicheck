import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, conversationHistory } = await req.json()
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY')

    if (!claudeApiKey) {
      throw new Error('CLAUDE_API_KEY nicht konfiguriert')
    }

    // Build conversation history for Claude
    const messages = [
      {
        role: 'user',
        content: `Du bist ein hilfreicher KI-Assistent für deutsche Sozialleistungen und Förderungen. 
        
Du hilfst Nutzern bei:
- Fragen zu Bürgergeld, Wohngeld, Kinderzuschlag, BAföG, etc.
- Erklärung von Anspruchsvoraussetzungen
- Hilfe beim Ausfüllen von Formularen
- Informationen zu benötigten Dokumenten
- Nächste Schritte nach der Antragstellung

Antworte freundlich, präzise und in einfacher Sprache. Wenn du dir unsicher bist, empfiehl dem Nutzer, sich an eine Beratungsstelle zu wenden.

Nutzer-Frage: ${message}`
      }
    ]

    // Claude API Call
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: messages
      })
    })

    if (!claudeResponse.ok) {
      const error = await claudeResponse.text()
      throw new Error(`Claude API Fehler: ${error}`)
    }

    const claudeData = await claudeResponse.json()
    const response = claudeData.content[0].text

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Chat error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
