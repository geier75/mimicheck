import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

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
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
        const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
        const STRIPE_PREMIUM_PRICE_ID = Deno.env.get('STRIPE_PREMIUM_PRICE_ID')
        const STRIPE_PRO_PRICE_ID = Deno.env.get('STRIPE_PRO_PRICE_ID')

        const validationResult = {
            success: true,
            checks: {
                stripe_secret_key: !!STRIPE_SECRET_KEY,
                stripe_webhook_secret: !!STRIPE_WEBHOOK_SECRET,
                premium_price_id: !!STRIPE_PREMIUM_PRICE_ID,
                pro_price_id: !!STRIPE_PRO_PRICE_ID
            },
            message: ''
        }

        if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !STRIPE_PREMIUM_PRICE_ID || !STRIPE_PRO_PRICE_ID) {
            validationResult.success = false
            validationResult.message = 'Einige Stripe Secrets fehlen.'
        } else {
            try {
                const testResponse = await fetch('https://api.stripe.com/v1/customers?limit=1', {
                    headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` }
                })

                if (!testResponse.ok) {
                    validationResult.success = false
                    validationResult.message = 'Stripe API Key ungültig.'
                } else {
                    validationResult.message = '✅ Stripe vollständig konfiguriert!'
                }
            } catch (error) {
                validationResult.success = false
                validationResult.message = `Fehler: ${error.message}`
            }
        }

        return new Response(
            JSON.stringify(validationResult),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
