import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    AlertTriangle, 
    CheckCircle, 
    Copy, 
    ExternalLink,
    Shield,
    CreditCard,
    Webhook,
    Code
} from 'lucide-react';

export default function StripeSetupGuide() {
    const [copiedStep, setCopiedStep] = useState(null);

    const copyToClipboard = (text, step) => {
        navigator.clipboard.writeText(text);
        setCopiedStep(step);
        setTimeout(() => setCopiedStep(null), 2000);
    };

    const backendFunctions = {
        createStripeCheckoutSession: `import { createClientFromRequest } from 'npm:@mimitech/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const mimitech = createClientFromRequest(req);
        const user = await mimitech.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
        const { planId, successUrl, cancelUrl } = await req.json();

        if (!planId || !['premium', 'pro'].includes(planId)) {
            return Response.json({ error: 'Invalid planId' }, { status: 400 });
        }

        const PRICE_IDS = {
            premium: Deno.env.get('STRIPE_PREMIUM_PRICE_ID'),
            pro: Deno.env.get('STRIPE_PRO_PRICE_ID')
        };

        // Get or create customer
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
                    'metadata[user_id]': user.id
                })
            });

            const customer = await customerResponse.json();
            customerId = customer.id;

            // Save to user
            await mimitech.asServiceRole.entities.User.update(user.id, {
                stripe_customer_id: customerId
            });
        }

        // Create checkout session
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
                'subscription_data[metadata][plan_id]': planId,
                allow_promotion_codes: 'true',
                billing_address_collection: 'required',
                locale: 'de'
            })
        });

        const session = await sessionResponse.json();

        if (!sessionResponse.ok) {
            throw new Error(session.error?.message || 'Stripe API error');
        }

        return Response.json({
            checkoutUrl: session.url,
            sessionId: session.id
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({
            error: 'Failed to create checkout session',
            message: error.message
        }, { status: 500 });
    }
});`,

        stripeWebhookHandler: `import { createClientFromRequest } from 'npm:@mimitech/sdk@0.7.1';
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';

Deno.serve(async (req) => {
    try {
        const mimitech = createClientFromRequest(req);
        const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        
        // Verify webhook signature
        const signature = req.headers.get('stripe-signature');
        const body = await req.text();
        
        // Parse webhook event
        const event = JSON.parse(body);
        
        // Handle different event types
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata.user_id;
            const planId = session.metadata.plan_id;

            await mimitech.asServiceRole.entities.User.update(userId, {
                subscription_tier: planId,
                stripe_customer_id: session.customer,
                subscription_status: 'active'
            });

            // Send welcome email
            const user = await mimitech.asServiceRole.entities.User.get(userId);
            await mimitech.asServiceRole.integrations.Core.SendEmail({
                to: user.email,
                subject: 'Willkommen bei MiMiCheck Premium! 🎉',
                body: \`<h1>Ihr \${planId === 'pro' ? 'Pro' : 'Premium'}-Abonnement ist aktiv!</h1>
                       <p>Vielen Dank für Ihr Vertrauen. Sie haben jetzt Zugriff auf alle Premium-Features.</p>\`
            });
        }

        if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object;
            const customerId = subscription.customer;
            
            const users = await mimitech.asServiceRole.entities.User.filter({
                stripe_customer_id: customerId
            });
            
            if (users.length > 0) {
                await mimitech.asServiceRole.entities.User.update(users[0].id, {
                    subscription_tier: 'free',
                    subscription_status: 'cancelled'
                });
            }
        }

        return Response.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({
            error: 'Webhook processing failed',
            message: error.message
        }, { status: 500 });
    }
});`,

        createCustomerPortalSession: `import { createClientFromRequest } from 'npm:@mimitech/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const mimitech = createClientFromRequest(req);
        const user = await mimitech.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!user.stripe_customer_id) {
            return Response.json({ error: 'No active subscription' }, { status: 400 });
        }

        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
        const { returnUrl } = await req.json();

        const sessionResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
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

        const session = await sessionResponse.json();

        if (!sessionResponse.ok) {
            throw new Error(session.error?.message || 'Stripe API error');
        }

        return Response.json({ portalUrl: session.url });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({
            error: 'Failed to create portal session',
            message: error.message
        }, { status: 500 });
    }
});`
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* CRITICAL SECURITY WARNING */}
            <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-300">
                    <strong className="font-bold text-lg block mb-2">🚨 SICHERHEITSWARNUNG!</strong>
                    <p className="mb-2">Sie haben Ihren Live Stripe Key im Chat geteilt. Dieser ist jetzt kompromittiert!</p>
                    <a 
                        href="https://dashboard.stripe.com/apikeys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                        <Shield className="w-4 h-4" />
                        JETZT Key regenerieren
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </AlertDescription>
            </Alert>

            {/* Header */}
            <Card className="border-none shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <CreditCard className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-black text-slate-900 dark:text-white">
                                Stripe Integration Setup
                            </CardTitle>
                            <p className="text-slate-600 dark:text-slate-300 mt-2">
                                Schritt-für-Schritt Anleitung zur Monetarisierung Ihrer App
                            </p>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Step 1: Stripe Products erstellen */}
            <Card className="shadow-xl">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600 text-white text-lg px-4 py-2">Schritt 1</Badge>
                        <CardTitle className="text-2xl font-bold">Produkte in Stripe erstellen</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ol className="space-y-4 text-slate-700 dark:text-slate-300">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                            <div>
                                <p>Gehen Sie zu <strong>Stripe Dashboard → Products</strong></p>
                                <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 mt-1">
                                    Stripe Products öffnen <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                            <div>
                                <p className="font-semibold mb-2">Erstellen Sie 2 Produkte:</p>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
                                    <div>
                                        <p className="font-bold text-purple-600">Premium Plan</p>
                                        <p className="text-sm">Name: Staatshilfen+ Premium</p>
                                        <p className="text-sm">Preis: €14.99 / Monat (wiederkehrend)</p>
                                        <p className="text-sm text-slate-500">Nach Erstellung kopieren Sie die Price ID (beginnt mit price_...)</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-pink-600">Pro Plan</p>
                                        <p className="text-sm">Name: Haushalt-Optimierer Pro</p>
                                        <p className="text-sm">Preis: €29.99 / Monat (wiederkehrend)</p>
                                        <p className="text-sm text-slate-500">Nach Erstellung kopieren Sie die Price ID (beginnt mit price_...)</p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ol>
                </CardContent>
            </Card>

            {/* Step 2: Webhook erstellen */}
            <Card className="shadow-xl">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-purple-600 text-white text-lg px-4 py-2">Schritt 2</Badge>
                        <CardTitle className="text-2xl font-bold">Webhook Endpoint erstellen</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ol className="space-y-4 text-slate-700 dark:text-slate-300">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                            <div>
                                <p>Gehen Sie zu <strong>Stripe Dashboard → Developers → Webhooks</strong></p>
                                <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 mt-1">
                                    Stripe Webhooks öffnen <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                            <div>
                                <p className="mb-2">Klicken Sie auf <strong>"Add endpoint"</strong> und verwenden Sie:</p>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                                    <p className="font-mono text-sm mb-2">https://[IHR-APP-SUBDOMAIN].mimitech.com/api/backend_functions/stripeWebhookHandler</p>
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => copyToClipboard('https://[IHR-APP-SUBDOMAIN].mimitech.com/api/backend_functions/stripeWebhookHandler', 'webhook')}
                                        className="mt-2"
                                    >
                                        {copiedStep === 'webhook' ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                        {copiedStep === 'webhook' ? 'Kopiert!' : 'URL Kopieren'}
                                    </Button>
                                </div>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">3</span>
                            <div>
                                <p className="mb-2">Wählen Sie diese Events aus:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>checkout.session.completed</li>
                                    <li>customer.subscription.created</li>
                                    <li>customer.subscription.updated</li>
                                    <li>customer.subscription.deleted</li>
                                </ul>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm">4</span>
                            <p>Nach Erstellung kopieren Sie das <strong>Signing Secret</strong> (beginnt mit whsec_...)</p>
                        </li>
                    </ol>
                </CardContent>
            </Card>

            {/* Step 3: Backend Functions erstellen */}
            <Card className="shadow-xl">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-green-600 text-white text-lg px-4 py-2">Schritt 3</Badge>
                        <CardTitle className="text-2xl font-bold">Backend Functions im Dashboard erstellen</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {Object.entries(backendFunctions).map(([name, code]) => (
                        <div key={name} className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Code className="w-5 h-5 text-green-600" />
                                    <h4 className="font-bold text-lg">{name}</h4>
                                </div>
                                <Button 
                                    size="sm"
                                    onClick={() => copyToClipboard(code, name)}
                                >
                                    {copiedStep === name ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                    {copiedStep === name ? 'Kopiert!' : 'Code kopieren'}
                                </Button>
                            </div>
                            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                                <pre className="text-xs text-green-400 font-mono">{code.substring(0, 200)}...</pre>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                Gehen Sie zu <strong>Dashboard → Functions</strong> und erstellen Sie eine neue Function mit diesem Code
                            </p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Step 4: Environment Variables */}
            <Card className="shadow-xl border-2 border-amber-500">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-amber-600 text-white text-lg px-4 py-2">Schritt 4</Badge>
                        <CardTitle className="text-2xl font-bold">Environment Variables setzen</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <Alert className="mb-4">
                        <Shield className="w-4 h-4" />
                        <AlertDescription>
                            Diese Keys wurden bereits über requestSecrets angefordert. Bitte tragen Sie sie im Dashboard ein.
                        </AlertDescription>
                    </Alert>
                    <div className="space-y-3">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                            <p className="font-mono text-sm font-bold mb-1">STRIPE_SECRET_KEY</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Ihr NEUER Stripe Secret Key (regenerieren Sie den alten!)</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                            <p className="font-mono text-sm font-bold mb-1">STRIPE_WEBHOOK_SECRET</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Webhook Signing Secret (whsec_...)</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                            <p className="font-mono text-sm font-bold mb-1">STRIPE_PREMIUM_PRICE_ID</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Premium Plan Price ID (price_...)</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                            <p className="font-mono text-sm font-bold mb-1">STRIPE_PRO_PRICE_ID</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Pro Plan Price ID (price_...)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Final Checklist */}
            <Card className="shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        Abschluss-Checkliste
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full border-2 border-green-600"></div>
                            <span>Stripe Products (Premium & Pro) erstellt ✓</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full border-2 border-green-600"></div>
                            <span>Webhook Endpoint konfiguriert ✓</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full border-2 border-green-600"></div>
                            <span>3 Backend Functions erstellt ✓</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full border-2 border-green-600"></div>
                            <span>Environment Variables gesetzt ✓</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full border-2 border-red-600"></div>
                            <span className="font-bold text-red-600">ALTEN STRIPE KEY REGENERIERT ✓</span>
                        </li>
                    </ul>
                    
                    <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-800">
                        <p className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                            🎉 Nach Abschluss ist Ihre Monetarisierung live!
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Testen Sie mit Stripe Test Mode, bevor Sie live gehen.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}