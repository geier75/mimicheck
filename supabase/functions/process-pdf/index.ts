// Edge Function: PDF verarbeiten und Felder extrahieren
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

    // Get PDF from request (base64 encoded)
    const { pdfData, filename } = await req.json()

    if (!pdfData) {
      throw new Error('PDF-Daten fehlen')
    }

    // Decode base64
    const pdfBytes = Uint8Array.from(atob(pdfData), c => c.charCodeAt(0))

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('pdfs')
      .upload(`${user.id}/${Date.now()}_${filename}`, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) throw new Error('Upload fehlgeschlagen: ' + uploadError.message)

    // Get public URL
    const { data: urlData } = supabaseClient
      .storage
      .from('pdfs')
      .getPublicUrl(uploadData.path)

    // Parse PDF fields (simplified - in production use pdf-parse)
    const parsedFields = await parsePdfFields(pdfBytes)

    return new Response(
      JSON.stringify({
        success: true,
        pdfUrl: urlData.publicUrl,
        fields: parsedFields,
        totalFields: parsedFields.length
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

async function parsePdfFields(pdfBytes: Uint8Array) {
  // Simplified PDF parsing
  // In production, use proper PDF parsing library
  
  // Common field names to look for
  const commonFields = [
    { name: 'vorname', label: 'Vorname', type: 'text' },
    { name: 'nachname', label: 'Nachname', type: 'text' },
    { name: 'geburtsdatum', label: 'Geburtsdatum', type: 'date' },
    { name: 'strasse', label: 'Straße', type: 'text' },
    { name: 'plz', label: 'PLZ', type: 'text' },
    { name: 'ort', label: 'Ort', type: 'text' },
    { name: 'email', label: 'E-Mail', type: 'email' },
    { name: 'telefon', label: 'Telefon', type: 'tel' }
  ]

  return commonFields
}
