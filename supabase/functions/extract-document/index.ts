// Supabase Edge Function: extract-document
// Extracts structured data from uploaded documents using OpenAI

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API Key not configured');
    }

    const { file_url, json_schema } = await req.json();

    if (!file_url) {
      throw new Error('file_url is required');
    }

    // Build the prompt for extraction
    const schemaDescription = json_schema ? JSON.stringify(json_schema, null, 2) : `{
      "titel": "string - Titel der Abrechnung",
      "abrechnungszeitraum": "string - z.B. 2023 oder 01.01.2023 - 31.12.2023",
      "verwalter": "string - Name der Hausverwaltung",
      "objekt_adresse": "string - Adresse des Objekts",
      "gesamtkosten": "number - Gesamtbetrag in Euro",
      "kostenposten": "array - Liste der einzelnen Kostenpositionen"
    }`;

    const prompt = `Analysiere dieses Dokument (Nebenkostenabrechnung/Betriebskostenabrechnung) und extrahiere die wichtigsten Daten.

Erwartetes JSON-Format:
${schemaDescription}

Wichtig:
- Extrahiere NUR Daten die im Dokument sichtbar sind
- Bei Beträgen: Nur Zahlen ohne Währungssymbol
- Bei fehlenden Daten: null verwenden
- Antworte NUR mit validem JSON, keine Erklärungen

Analysiere das Dokument:`;

    // Call OpenAI with vision capability
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: file_url,
                  detail: 'high'
                } 
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Parse JSON from response
    let extractedData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Return raw content if JSON parsing fails
      extractedData = {
        raw_text: content,
        parse_error: true
      };
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        output: extractedData,
        model: 'gpt-4o'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Extract document error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
