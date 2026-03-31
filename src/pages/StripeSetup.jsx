import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from '@/api/entities';
import {
    CheckCircle,
    Copy,
    ExternalLink,
    AlertTriangle,
    Shield,
    Code,
    ArrowRight,
    Info
} from 'lucide-react';

/**
 * STRIPE SETUP MIT VISUELLER ANLEITUNG
 * Zeigt dem User GENAU wie er Backend Functions erstellt
 */
export default function StripeSetup() {
    const [user, setUser] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        User.me().then(setUser).catch(console.error);
    }, []);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Die 4 Backend Functions
    const functions = {
        validateStripeSetup: `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
                    headers: { 'Authorization': \`Bearer \${STRIPE_SECRET_KEY}\` }
                })

                if (!testResponse.ok) {
                    validationResult.success = false
                    validationResult.message = 'Stripe API Key ungültig.'
                } else {
                    validationResult.message = '✅ Stripe vollständig konfiguriert!'
                }
            } catch (error) {
                validationResult.success = false
                validationResult.message = \`Fehler: \${error.message}\`
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
})`,

        createStripeCheckoutSession: `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
            throw new Error(\`Price ID for \${planId} not configured\`)
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
})`,

        createCustomerPortalSession: `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

        const customerId = user.user_metadata?.stripe_customer_id

        if (!customerId) {
            return new Response(
                JSON.stringify({ error: 'No subscription found (missing stripe_customer_id)' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const { returnUrl } = await req.json()

        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
        if (!STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY not set')
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        })

        return new Response(
            JSON.stringify({ portalUrl: session.url }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Portal Session Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})`,

        stripeWebhookHandler: `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
            console.error(\`Webhook signature verification failed: \${err.message}\`)
            return new Response(\`Webhook Error: \${err.message}\`, { status: 400 })
        }

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                const userId = session.metadata?.user_id
                const planId = session.metadata?.plan_id

                if (userId && planId) {
                    console.log(\`Processing checkout for user \${userId}, plan \${planId}\`)
                    
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
                    console.log(\`Payment succeeded for user \${userId}\`)
                    
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
                    console.log(\`Subscription deleted for user \${userId}\`)
                    
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
})`
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                    Stripe Backend Setup - Detaillierte Anleitung
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                    Folgen Sie dieser Schritt-für-Schritt-Anleitung, um alle Backend Functions zu erstellen
                </p>
            </div>

            {/* Admin Check */}
            {user && user.role !== 'admin' && (
                <Alert variant="destructive">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                        <strong>⚠️ PROBLEM GEFUNDEN:</strong> Sie sind kein Admin!
                        Backend Functions können nur von Admins erstellt werden.
                        Kontaktieren Sie bitte den App-Besitzer, um Admin-Rechte zu erhalten.
                    </AlertDescription>
                </Alert>
            )}

            {/* Schritt 1: Dashboard öffnen */}
            <Card className="border-2 border-blue-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white text-lg px-4 py-2">SCHRITT 1</Badge>
                        Dashboard öffnen
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription>
                            <strong>WO?</strong> In einem neuen Browser-Tab
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <p className="text-slate-700 dark:text-slate-300">
                            1. Öffnen Sie in einem <strong>NEUEN TAB</strong>: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">https://mimitech.com/dashboard</code>
                        </p>
                        <p className="text-slate-700 dark:text-slate-300">
                            2. Oder klicken Sie oben rechts auf <strong>"Dashboard"</strong>
                        </p>
                    </div>

                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => window.open('https://mimitech.com/dashboard', '_blank')}
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Dashboard in neuem Tab öffnen
                    </Button>
                </CardContent>
            </Card>

            {/* Schritt 2: Code → Functions */}
            <Card className="border-2 border-purple-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Badge className="bg-purple-600 text-white text-lg px-4 py-2">SCHRITT 2</Badge>
                        Zum Functions-Bereich navigieren
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <p className="text-slate-700 dark:text-slate-300">
                            Im Dashboard (das Sie gerade geöffnet haben):
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
                            <li>Finden Sie in der <strong>linken Sidebar</strong> den Menüpunkt <strong>"Code"</strong></li>
                            <li>Klicken Sie auf <strong>"Code"</strong></li>
                            <li>Es öffnet sich ein Untermenü</li>
                            <li>Klicken Sie auf <strong>"Functions"</strong></li>
                        </ol>
                    </div>

                    <Alert>
                        <Code className="h-4 w-4" />
                        <AlertDescription>
                            Sie sollten jetzt eine Seite sehen mit der Überschrift "Backend Functions"
                            und einem Button <strong>"+ New Function"</strong>
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Schritt 3: Functions erstellen */}
            <Card className="border-2 border-green-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Badge className="bg-green-600 text-white text-lg px-4 py-2">SCHRITT 3</Badge>
                        4 Functions erstellen (nacheinander)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription>
                            <strong>WICHTIG:</strong> Erstellen Sie ALLE 4 Functions nacheinander.
                            Für jede Function: Code kopieren → New Function → Einfügen → Save
                        </AlertDescription>
                    </Alert>

                    {Object.entries(functions).map(([name, code], index) => (
                        <div key={name} className="border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Badge className="bg-slate-600 text-white">Function {index + 1}/4</Badge>
                                    {name}
                                </h3>
                                <Button
                                    onClick={() => copyToClipboard(code, name)}
                                    variant={copiedCode === name ? "default" : "outline"}
                                >
                                    {copiedCode === name ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                            Kopiert!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Code kopieren
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="space-y-3 text-sm">
                                <p className="font-semibold text-slate-700 dark:text-slate-300">GENAU SO VORGEHEN:</p>
                                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 ml-4">
                                    <li>Klicken Sie oben auf "<strong>Code kopieren</strong>"</li>
                                    <li>Gehen Sie zurück zum Dashboard-Tab</li>
                                    <li>Klicken Sie auf "<strong>+ New Function</strong>"</li>
                                    <li>Geben Sie als Name ein: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{name}</code></li>
                                    <li>Löschen Sie den Beispiel-Code im Editor</li>
                                    <li>Fügen Sie den kopierten Code ein (Strg+V / Cmd+V)</li>
                                    <li>Klicken Sie auf "<strong>Save</strong>" (oben rechts)</li>
                                    <li>Warten Sie bis "Saved successfully" erscheint</li>
                                </ol>
                            </div>

                            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs max-h-32">
                                <code>{code.substring(0, 200)}...</code>
                            </pre>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Schritt 4: Environment Variables */}
            <Card className="border-2 border-orange-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Badge className="bg-orange-600 text-white text-lg px-4 py-2">SCHRITT 4</Badge>
                        Environment Variables setzen
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Die Backend Functions benötigen 4 Secrets von Stripe
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                        <p className="font-semibold">Im Dashboard:</p>
                        <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
                            <li>Gehen Sie zu <strong>Settings</strong> (linke Sidebar)</li>
                            <li>Klicken Sie auf <strong>Environment Variables</strong></li>
                            <li>Fügen Sie folgende 4 Variablen hinzu:</li>
                        </ol>

                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg space-y-2 text-sm">
                            <div><strong>STRIPE_SECRET_KEY</strong> = sk_live_... (von Stripe Dashboard)</div>
                            <div><strong>STRIPE_WEBHOOK_SECRET</strong> = whsec_... (von Stripe Webhooks)</div>
                            <div><strong>STRIPE_PREMIUM_PRICE_ID</strong> = price_... (Premium Produkt)</div>
                            <div><strong>STRIPE_PRO_PRICE_ID</strong> = price_... (Pro Produkt)</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Fertig! */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Geschafft! 🎉
                            </h2>
                            <p className="text-slate-700 dark:text-slate-300 mt-2">
                                Sobald alle 4 Functions erstellt sind, ist Stripe vollständig integriert
                                und die Pricing-Seite funktioniert automatisch!
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}