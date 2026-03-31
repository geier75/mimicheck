import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle, Code, AlertTriangle } from 'lucide-react';

/**
 * ALLE BACKEND FUNCTION TEMPLATES
 * Copy-Paste fertig für Dashboard → Code → Functions
 */
export default function BackendFunctionTemplates() {
    const [copiedFunction, setCopiedFunction] = useState(null);

    const copyToClipboard = (text, functionName) => {
        navigator.clipboard.writeText(text);
        setCopiedFunction(functionName);
        setTimeout(() => setCopiedFunction(null), 2000);
    };

    const functions = {
        createStripeCheckoutSession: {
            name: 'createStripeCheckoutSession',
            description: 'Erstellt eine Stripe Checkout Session für Premium/Pro Upgrade',
            requiredSecrets: ['STRIPE_SECRET_KEY', 'STRIPE_PREMIUM_PRICE_ID', 'STRIPE_PRO_PRICE_ID'],
            code: `import { createClientFromRequest } from 'npm:@mimitech/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        // ✅ AUTHENTICATION REQUIRED
        const mimitech = createClientFromRequest(req);
        const user = await mimitech.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ✅ GET SECRETS
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
        if (!STRIPE_SECRET_KEY) {
            return Response.json({ error: 'Stripe not configured' }, { status: 500 });
        }

        // ✅ PARSE REQUEST
        const { planId, successUrl, cancelUrl } = await req.json();

        if (!planId || !['premium', 'pro'].includes(planId)) {
            return Response.json({ error: 'Invalid planId' }, { status: 400 });
        }

        const PRICE_IDS = {
            premium: Deno.env.get('STRIPE_PREMIUM_PRICE_ID'),
            pro: Deno.env.get('STRIPE_PRO_PRICE_ID')
        };

        if (!PRICE_IDS[planId]) {
            return Response.json({ error: 'Price ID not configured' }, { status: 500 });
        }

        // ✅ GET OR CREATE STRIPE CUSTOMER
        let customerId = user.stripe_customer_id;

        if (!customerId) {
            const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
                method: 'POST',
                headers: {
                    'Authorization': \`Bearer \${STRIPE_SECRET_KEY}\`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    email: user.email,
                    name: user.full_name || user.email,
                    'metadata[user_id]': user.id,
                    'metadata[base44_app]': 'staatshilfen'
                })
            });

            if (!customerResponse.ok) {
                throw new Error('Failed to create Stripe customer');
            }

            const customer = await customerResponse.json();
            customerId = customer.id;

            // Save to User Entity
            await mimitech.asServiceRole.entities.User.update(user.id, {
                stripe_customer_id: customerId
            });
        }

        // ✅ CREATE CHECKOUT SESSION
        const sessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${STRIPE_SECRET_KEY}\`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                customer: customerId,
                mode: 'subscription',
                'payment_method_types[]': 'card',
                'line_items[0][price]': PRICE_IDS[planId],
                'line_items[0][quantity]': '1',
                success_url: successUrl,
                cancel_url: cancelUrl,
                'metadata[user_id]': user.id,
                'metadata[plan_id]': planId,
                'subscription_data[metadata][user_id]': user.id,
                'subscription_data[metadata][plan_id]': planId
            })
        });

        if (!sessionResponse.ok) {
            const error = await sessionResponse.json();
            throw new Error(error.error?.message || 'Failed to create checkout session');
        }

        const session = await sessionResponse.json();

        return Response.json({ 
            checkoutUrl: session.url,
            sessionId: session.id 
        });

    } catch (error) {
        console.error('createStripeCheckoutSession Error:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
});`
        },

        stripeWebhookHandler: {
            name: 'stripeWebhookHandler',
            description: 'Verarbeitet Stripe Webhook Events (checkout.session.completed, invoice.*, etc.)',
            requiredSecrets: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
            code: `import { createClientFromRequest } from 'npm:@mimitech/sdk@0.7.1';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
    try {
        // ✅ GET SECRETS
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
        const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');

        if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
            return Response.json({ error: 'Stripe not configured' }, { status: 500 });
        }

        // ✅ INITIALIZE STRIPE
        const stripe = new Stripe(STRIPE_SECRET_KEY);

        // ✅ VERIFY WEBHOOK SIGNATURE
        const signature = req.headers.get('stripe-signature');
        const body = await req.text();

        let event;
        try {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature,
                STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return Response.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // ✅ INITIALIZE BASE44 SERVICE ROLE (NO USER AUTH NEEDED FOR WEBHOOKS)
        const mimitech = createClientFromRequest(req);

        // ✅ PROCESS EVENT
        console.log('Processing Stripe event:', event.type);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.metadata.user_id;
                const planId = session.metadata.plan_id;

                if (userId && planId) {
                    // Update user subscription
                    await mimitech.asServiceRole.entities.User.update(userId, {
                        subscription_tier: planId,
                        subscription_status: 'active',
                        stripe_subscription_id: session.subscription
                    });
                    console.log(\`✅ User \${userId} upgraded to \${planId}\`);
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                const subscription = invoice.subscription;
                
                // Get subscription metadata
                const subData = await stripe.subscriptions.retrieve(subscription);
                const userId = subData.metadata.user_id;

                if (userId) {
                    await mimitech.asServiceRole.entities.User.update(userId, {
                        subscription_status: 'active'
                    });
                    console.log(\`✅ Payment succeeded for user \${userId}\`);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const subscription = invoice.subscription;
                
                const subData = await stripe.subscriptions.retrieve(subscription);
                const userId = subData.metadata.user_id;

                if (userId) {
                    await mimitech.asServiceRole.entities.User.update(userId, {
                        subscription_status: 'past_due'
                    });
                    console.log(\`⚠️ Payment failed for user \${userId}\`);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const userId = subscription.metadata.user_id;

                if (userId) {
                    await mimitech.asServiceRole.entities.User.update(userId, {
                        subscription_tier: 'free',
                        subscription_status: 'cancelled',
                        stripe_subscription_id: null
                    });
                    console.log(\`❌ Subscription cancelled for user \${userId}\`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const userId = subscription.metadata.user_id;
                const planId = subscription.metadata.plan_id;

                if (userId) {
                    await mimitech.asServiceRole.entities.User.update(userId, {
                        subscription_tier: planId || 'premium',
                        subscription_status: subscription.status
                    });
                    console.log(\`🔄 Subscription updated for user \${userId}\`);
                }
                break;
            }

            default:
                console.log(\`Unhandled event type: \${event.type}\`);
        }

        return Response.json({ received: true });

    } catch (error) {
        console.error('stripeWebhookHandler Error:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
});`
        },

        createCustomerPortalSession: {
            name: 'createCustomerPortalSession',
            description: 'Erstellt Stripe Customer Portal Session für Abo-Verwaltung',
            requiredSecrets: ['STRIPE_SECRET_KEY'],
            code: `import { createClientFromRequest } from 'npm:@mimitech/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        // ✅ AUTHENTICATION REQUIRED
        const mimitech = createClientFromRequest(req);
        const user = await mimitech.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ✅ CHECK IF USER HAS STRIPE CUSTOMER
        if (!user.stripe_customer_id) {
            return Response.json({ 
                error: 'No active subscription found' 
            }, { status: 400 });
        }

        // ✅ GET SECRETS
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
        if (!STRIPE_SECRET_KEY) {
            return Response.json({ error: 'Stripe not configured' }, { status: 500 });
        }

        // ✅ PARSE REQUEST
        const { returnUrl } = await req.json();

        // ✅ CREATE PORTAL SESSION
        const portalResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${STRIPE_SECRET_KEY}\`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                customer: user.stripe_customer_id,
                return_url: returnUrl
            })
        });

        if (!portalResponse.ok) {
            const error = await portalResponse.json();
            throw new Error(error.error?.message || 'Failed to create portal session');
        }

        const portalSession = await portalResponse.json();

        return Response.json({ 
            portalUrl: portalSession.url 
        });

    } catch (error) {
        console.error('createCustomerPortalSession Error:', error);
        return Response.json({ 
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
});`
        },

        validateStripeSetup: {
            name: 'validateStripeSetup',
            description: 'Validiert ob Stripe korrekt konfiguriert ist (Secrets, Functions, Products)',
            requiredSecrets: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_PREMIUM_PRICE_ID', 'STRIPE_PRO_PRICE_ID'],
            code: `import { createClientFromRequest } from 'npm:@mimitech/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        // ✅ AUTHENTICATION REQUIRED
        const mimitech = createClientFromRequest(req);
        const user = await mimitech.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ✅ CHECK REQUIRED SECRETS
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
        const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        const STRIPE_PREMIUM_PRICE_ID = Deno.env.get('STRIPE_PREMIUM_PRICE_ID');
        const STRIPE_PRO_PRICE_ID = Deno.env.get('STRIPE_PRO_PRICE_ID');

        const validationResult = {
            success: true,
            checks: {
                stripe_secret_key: !!STRIPE_SECRET_KEY,
                stripe_webhook_secret: !!STRIPE_WEBHOOK_SECRET,
                premium_price_id: !!STRIPE_PREMIUM_PRICE_ID,
                pro_price_id: !!STRIPE_PRO_PRICE_ID
            },
            message: ''
        };

        // Check if all required secrets are set
        if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !STRIPE_PREMIUM_PRICE_ID || !STRIPE_PRO_PRICE_ID) {
            validationResult.success = false;
            validationResult.message = 'Einige Stripe Secrets fehlen. Bitte im Dashboard → Settings → Environment Variables setzen.';
        } else {
            // ✅ TEST STRIPE CONNECTION
            try {
                const testResponse = await fetch('https://api.stripe.com/v1/customers?limit=1', {
                    headers: {
                        'Authorization': \`Bearer \${STRIPE_SECRET_KEY}\`
                    }
                });

                if (!testResponse.ok) {
                    validationResult.success = false;
                    validationResult.message = 'Stripe API Key ungültig oder abgelaufen.';
                } else {
                    validationResult.message = '✅ Stripe ist vollständig konfiguriert und einsatzbereit!';
                }
            } catch (error) {
                validationResult.success = false;
                validationResult.message = \`Fehler bei Stripe-Verbindung: \${error.message}\`;
            }
        }

        return Response.json(validationResult);

    } catch (error) {
        console.error('validateStripeSetup Error:', error);
        return Response.json({ 
            success: false,
            error: error.message || 'Internal server error' 
        }, { status: 500 });
    }
});`
        }
    };

    return (
        <div className="space-y-6">
            <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                    <strong>Setup-Anleitung:</strong> Kopieren Sie die Backend Functions und erstellen Sie sie im <strong>Dashboard → Code → Functions</strong>. 
                    Nach dem Erstellen arbeitet der Backend Agent vollautomatisch.
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="checkout" className="w-full">
                <TabsList className="grid grid-cols-4 gap-2">
                    <TabsTrigger value="checkout">Checkout</TabsTrigger>
                    <TabsTrigger value="webhook">Webhook</TabsTrigger>
                    <TabsTrigger value="portal">Portal</TabsTrigger>
                    <TabsTrigger value="validate">Validate</TabsTrigger>
                </TabsList>

                {Object.entries(functions).map(([key, func]) => (
                    <TabsContent key={key} value={key.replace('create', '').replace('Handler', '').replace('Stripe', '').toLowerCase()} className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Code className="w-5 h-5" />
                                            {func.name}
                                        </CardTitle>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                            {func.description}
                                        </p>
                                    </div>
                                    <Badge variant="outline">
                                        {func.requiredSecrets.length} Secrets erforderlich
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Required Secrets */}
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Erforderliche Environment Variables:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {func.requiredSecrets.map(secret => (
                                            <Badge key={secret} className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                                                {secret}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Code Block */}
                                <div className="relative">
                                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs max-h-96">
                                        <code>{func.code}</code>
                                    </pre>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="absolute top-2 right-2"
                                        onClick={() => copyToClipboard(func.code, func.name)}
                                    >
                                        {copiedFunction === func.name ? (
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

                                {/* Setup Steps */}
                                <Alert>
                                    <AlertDescription>
                                        <ol className="list-decimal list-inside space-y-2 text-sm">
                                            <li>Kopieren Sie den Code oben</li>
                                            <li>Öffnen Sie <strong>Dashboard → Code → Functions</strong></li>
                                            <li>Klicken Sie auf <strong>"New Function"</strong></li>
                                            <li>Name: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{func.name}</code></li>
                                            <li>Fügen Sie den kopierten Code ein</li>
                                            <li>Klicken Sie auf <strong>"Save"</strong></li>
                                        </ol>
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}