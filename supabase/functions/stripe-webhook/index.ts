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
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
        const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing environment variables')
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        const signature = req.headers.get('stripe-signature')
        if (!signature) {
            return new Response('No signature', { status: 400 })
        }

        const body = await req.text()
        let event

        try {
            event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET)
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`)
            return new Response(`Webhook Error: ${err.message}`, { status: 400 })
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                const userId = session.metadata?.user_id
                const planId = session.metadata?.plan_id

                if (userId && planId) {
                    console.log(`Processing checkout for user ${userId}, plan ${planId}`)

                    // Update user_profiles
                    const { error: profileError } = await supabaseAdmin
                        .from('users')
                        .update({
                            subscription_tier: planId,
                            subscription_status: 'active',
                            stripe_subscription_id: session.subscription
                        })
                        .eq('auth_id', userId)

                    if (profileError) console.error('Error updating profile:', profileError)

                    // Update auth metadata
                    await supabaseAdmin.auth.updateUserById(userId, {
                        user_metadata: { subscription_tier: planId }
                    })
                }
                break
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object
                const subscriptionId = invoice.subscription
                const subscription = await stripe.subscriptions.retrieve(subscriptionId)
                const userId = subscription.metadata?.user_id

                if (userId) {
                    console.log(`Payment succeeded for user ${userId}`)

                    await supabaseAdmin
                        .from('users')
                        .update({ subscription_status: 'active' })
                        .eq('auth_id', userId)
                }
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object
                const userId = subscription.metadata?.user_id

                if (userId) {
                    console.log(`Subscription deleted for user ${userId}`)

                    await supabaseAdmin
                        .from('users')
                        .update({
                            subscription_tier: 'free',
                            subscription_status: 'cancelled',
                            stripe_subscription_id: null
                        })
                        .eq('auth_id', userId)

                    await supabaseAdmin.auth.updateUserById(userId, {
                        user_metadata: { subscription_tier: 'free' }
                    })
                }
                break
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error('Webhook handler error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
