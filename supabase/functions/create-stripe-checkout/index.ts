import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import Stripe from "https://esm.sh/stripe@14.14.0"

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

        const { planId, successUrl, cancelUrl } = await req.json()

        if (!planId || !['premium', 'pro'].includes(planId)) {
            return new Response(
                JSON.stringify({ error: 'Invalid planId' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
        if (!STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY not set')
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        const PRICE_IDS = {
            premium: Deno.env.get('STRIPE_PREMIUM_PRICE_ID'),
            pro: Deno.env.get('STRIPE_PRO_PRICE_ID')
        }

        if (!PRICE_IDS[planId]) {
            throw new Error(`Price ID for ${planId} not configured`)
        }

        // Get or create customer
        let customerId = user.user_metadata?.stripe_customer_id

        if (!customerId) {
            // Check if customer exists in Stripe by email
            const customers = await stripe.customers.list({ email: user.email, limit: 1 });

            if (customers.data.length > 0) {
                customerId = customers.data[0].id;
            } else {
                // Create new customer
                const customer = await stripe.customers.create({
                    email: user.email,
                    name: user.user_metadata?.full_name || user.email,
                    metadata: {
                        user_id: user.id
                    }
                });
                customerId = customer.id;
            }

            // Update user metadata with stripe_customer_id
            await supabaseClient.auth.updateUser({
                data: { stripe_customer_id: customerId }
            });
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: PRICE_IDS[planId],
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                user_id: user.id,
                plan_id: planId
            },
            subscription_data: {
                metadata: {
                    user_id: user.id,
                    plan_id: planId
                }
            }
        })

        return new Response(
            JSON.stringify({ checkoutUrl: session.url, sessionId: session.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Stripe Checkout Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
