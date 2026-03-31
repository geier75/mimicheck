
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    CheckCircle, 
    Copy, 
    ExternalLink,
    AlertTriangle,
    Loader2,
    Code,
    Key,
    CreditCard,
    Webhook,
    Shield,
    Zap
} from 'lucide-react';
import { User } from '@/api/entities';

/**
 * INTERAKTIVER STRIPE SETUP WIZARD
 * Führt User Schritt-für-Schritt durch die komplette Stripe-Integration
 */
export default function StripeSetupWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [setupStatus, setSetupStatus] = useState({
        secretsSet: false,
        functionsCreated: false,
        productsCreated: false,
        webhookConfigured: false
    });
    const [user, setUser] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);
    const [isValidating, setIsValidating] = useState(false);

    useEffect(() => {
        User.me().then(setUser).catch(console.error);
    }, []);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // VALIDATION: Check if secrets are set
    const validateSecrets = async () => {
        setIsValidating(true);
        try {
            // Try to call a backend function that requires secrets
            const response = await fetch('/api/functions/validateStripeSetup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ check: 'secrets' })
            });

            const result = await response.json();
            setSetupStatus(prev => ({ ...prev, secretsSet: result.success }));
            
            if (result.success) {
                setCurrentStep(2);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setIsValidating(false);
        }
    };

    // Backend Function Code Templates
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
                locale: 'de'
            })
        });

        const session = await sessionResponse.json();

        return Response.json({
            checkoutUrl: session.url,
            sessionId: session.id
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});`,

        stripeWebhookHandler: `import { createClientFromRequest } from 'npm:@mimitech/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const mimitech = createClientFromRequest(req);
        
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
        const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        
        const signature = req.headers.get('stripe-signature');
        const body = await req.text();

        // Verify webhook signature
        const verifyResponse = await fetch('https://api.stripe.com/v1/webhook_endpoints/verify', {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${STRIPE_SECRET_KEY}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payload: body,
                signature: signature,
                secret: WEBHOOK_SECRET
            })
        });

        if (!verifyResponse.ok) {
            return Response.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(body);

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.metadata.user_id;
                const planId = session.metadata.plan_id;

                await mimitech.asServiceRole.entities.User.update(userId, {
                    subscription_tier: planId,
                    subscription_status: 'active',
                    stripe_subscription_id: session.subscription
                });

                console.log(\`User \${userId} upgraded to \${planId}\`);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const customerId = subscription.customer;

                // Find user by customer ID
                const users = await mimitech.asServiceRole.entities.User.filter({
                    stripe_customer_id: customerId
                });

                if (users.length > 0) {
                    const user = users[0];
                    await mimitech.asServiceRole.entities.User.update(user.id, {
                        subscription_status: subscription.status
                    });
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const customerId = subscription.customer;

                const users = await mimitech.asServiceRole.entities.User.filter({
                    stripe_customer_id: customerId
                });

                if (users.length > 0) {
                    const user = users[0];
                    await mimitech.asServiceRole.entities.User.update(user.id, {
                        subscription_tier: 'free',
                        subscription_status: 'cancelled'
                    });
                }
                break;
            }
        }

        return Response.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});`,

        createCustomerPortalSession: `import { createClientFromRequest } from 'npm:@mimitech/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const mimitech = createClientFromRequest(req);
        const user = await mimitech.auth.me();
        
        if (!user || !user.stripe_customer_id) {
            return Response.json({ error: 'No subscription found' }, { status: 400 });
        }

        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
        const { returnUrl } = await req.json();

        const portalResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${STRIPE_SECRET_KEY}\`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                customer: user.stripe_customer_id,
                return_url: returnUrl || \`\${Deno.env.get('APP_URL')}/dashboard\`
            })
        });

        const portal = await portalResponse.json();

        return Response.json({
            portalUrl: portal.url
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});`,

        validateStripeSetup: `import { createClientFromRequest } from 'npm:@mimitech/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        // 🔒 SECURITY: Require authentication
        const mimitech = createClientFromRequest(req);
        const user = await mimitech.auth.me();
        
        if (!user) {
            return Response.json({ 
                error: 'Unauthorized',
                success: false 
            }, { status: 401 });
        }

        // OPTIONAL: Restrict to admin users only
        if (user.role !== 'admin') {
            return Response.json({ 
                error: 'Admin access required',
                success: false 
            }, { status: 403 });
        }

        // Check if all required secrets are set
        const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
        const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        const PREMIUM_PRICE_ID = Deno.env.get('STRIPE_PREMIUM_PRICE_ID');
        const PRO_PRICE_ID = Deno.env.get('STRIPE_PRO_PRICE_ID');

        const checks = {
            stripe_key: !!STRIPE_SECRET_KEY,
            webhook_secret: !!WEBHOOK_SECRET,
            premium_price: !!PREMIUM_PRICE_ID,
            pro_price: !!PRO_PRICE_ID
        };

        const allValid = Object.values(checks).every(v => v);

        return Response.json({
            success: allValid,
            checks,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Validation error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});`
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Progress Header */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                Stripe Setup Wizard
                            </CardTitle>
                            <p className="text-slate-600 dark:text-slate-300">
                                Vollständige Monetarisierung in 4 Schritten
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4].map(step => (
                                <div key={step} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                                    step === currentStep 
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-110 shadow-lg' 
                                        : step < currentStep
                                            ? 'bg-green-500 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                }`}>
                                    {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Step 1: Environment Variables / Secrets */}
            {currentStep === 1 && (
                <Card className="border-none shadow-xl">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Key className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">Schritt 1: Stripe API Keys einrichten</CardTitle>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Sichere Konfiguration der Umgebungsvariablen</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <AlertDescription className="text-red-800 dark:text-red-200">
                                <strong>WICHTIG:</strong> Falls Sie Ihren Live-Key bereits im Chat geteilt haben, gehen Sie SOFORT zu{' '}
                                <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline font-bold">
                                    Stripe Dashboard → API Keys
                                </a>
                                {' '}und regenerieren Sie ihn!
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-green-600" />
                                    Environment Variables setzen
                                </h4>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                    <li>Gehen Sie zu <strong>Dashboard → Settings → Environment Variables</strong></li>
                                    <li>Klicken Sie auf <strong>"Add Variable"</strong></li>
                                    <li>Fügen Sie folgende 4 Variables hinzu:</li>
                                </ol>

                                <div className="mt-4 space-y-3">
                                    {[
                                        { name: 'STRIPE_SECRET_KEY', desc: 'Ihr Stripe Secret Key (sk_live_... oder sk_test_...)', link: 'https://dashboard.stripe.com/apikeys' },
                                        { name: 'STRIPE_WEBHOOK_SECRET', desc: 'Webhook Signing Secret (kommt in Schritt 3)', link: null },
                                        { name: 'STRIPE_PREMIUM_PRICE_ID', desc: 'Price ID für Premium Plan (price_...)', link: 'https://dashboard.stripe.com/products' },
                                        { name: 'STRIPE_PRO_PRICE_ID', desc: 'Price ID für Pro Plan (price_...)', link: 'https://dashboard.stripe.com/products' }
                                    ].map(variable => (
                                        <div key={variable.name} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                        {variable.name}
                                                    </code>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{variable.desc}</p>
                                                </div>
                                                {variable.link && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.open(variable.link, '_blank')}
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    onClick={validateSecrets}
                                    disabled={isValidating}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                >
                                    {isValidating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    Secrets validieren & weiter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Backend Functions */}
            {currentStep === 2 && (
                <Card className="border-none shadow-xl">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                                <Code className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">Schritt 2: Backend Functions erstellen</CardTitle>
                                <p className="text-sm text-slate-600 dark:text-slate-400">4 Functions für sichere Stripe-Kommunikation</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <AlertDescription className="text-blue-800 dark:text-blue-200">
                                Gehen Sie zu <strong>Dashboard → Code → Functions</strong> und erstellen Sie für jede Function unten einen neuen Eintrag.
                            </AlertDescription>
                        </Alert>

                        <Tabs defaultValue="createCheckout" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="createCheckout">Checkout</TabsTrigger>
                                <TabsTrigger value="webhook">Webhook</TabsTrigger>
                                <TabsTrigger value="portal">Portal</TabsTrigger>
                                <TabsTrigger value="validate">Validate</TabsTrigger>
                            </TabsList>

                            {Object.entries(backendFunctions).map(([name, code]) => (
                                <TabsContent key={name} value={name.replace('createStripeCheckoutSession', 'createCheckout').replace('stripeWebhookHandler', 'webhook').replace('createCustomerPortalSession', 'portal').replace('validateStripeSetup', 'validate')} className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                        <div>
                                            <code className="font-mono font-semibold">{name}</code>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                Pfad: <code>/functions/{name}.js</code>
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(code, name)}
                                        >
                                            {copiedCode === name ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                            {copiedCode === name ? 'Kopiert!' : 'Code kopieren'}
                                        </Button>
                                    </div>

                                    <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-xs">
                                        <code>{code}</code>
                                    </pre>
                                </TabsContent>
                            ))}
                        </Tabs>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(1)}
                            >
                                Zurück
                            </Button>
                            <Button
                                onClick={() => setCurrentStep(3)}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                Weiter zu Stripe Products
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Stripe Products & Prices */}
            {currentStep === 3 && (
                <Card className="border-none shadow-xl">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">Schritt 3: Stripe Products erstellen</CardTitle>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Premium & Pro Subscription-Produkte anlegen</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-blue-600" />
                                    Premium Plan - €14.99/Monat
                                </h4>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                    <li>Gehe zu <a href="https://dashboard.stripe.com/products" target="_blank" className="text-blue-600 underline">Stripe Dashboard → Products</a></li>
                                    <li>Klicke auf <strong>"Add Product"</strong></li>
                                    <li>
                                        <strong>Name:</strong> <code>MiMiCheck Premium</code><br />
                                        <strong>Description:</strong> <code>Unbegrenzte Förderprüfungen und Nebenkostenchecks</code>
                                    </li>
                                    <li>
                                        <strong>Pricing:</strong> Recurring<br />
                                        <strong>Amount:</strong> <code>14.99 EUR</code><br />
                                        <strong>Billing Period:</strong> Monthly
                                    </li>
                                    <li>Speichern und kopiere die <strong>Price ID</strong> (beginnt mit <code>price_</code>)</li>
                                    <li>Füge die Price ID als <code>STRIPE_PREMIUM_PRICE_ID</code> in den Environment Variables ein</li>
                                </ol>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-purple-600" />
                                    Pro Plan - €29.99/Monat
                                </h4>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                    <li>Wiederhole den Prozess für den Pro Plan</li>
                                    <li>
                                        <strong>Name:</strong> <code>MiMiCheck Pro</code><br />
                                        <strong>Description:</strong> <code>Alle Premium Features + Familien-Verwaltung & Steuer-KI</code>
                                    </li>
                                    <li>
                                        <strong>Amount:</strong> <code>29.99 EUR</code>
                                    </li>
                                    <li>Füge die Price ID als <code>STRIPE_PRO_PRICE_ID</code> in den Environment Variables ein</li>
                                </ol>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(2)}
                            >
                                Zurück
                            </Button>
                            <Button
                                onClick={() => setCurrentStep(4)}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                Weiter zu Webhook Setup
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Webhook Configuration */}
            {currentStep === 4 && (
                <Card className="border-none shadow-xl">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                                <Webhook className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">Schritt 4: Stripe Webhook konfigurieren</CardTitle>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Automatische Synchronisation bei Zahlungen</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <h4 className="font-semibold mb-3">Webhook Endpoint erstellen</h4>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                    <li>Gehe zu <a href="https://dashboard.stripe.com/webhooks" target="_blank" className="text-blue-600 underline">Stripe Dashboard → Webhooks</a></li>
                                    <li>Klicke auf <strong>"Add endpoint"</strong></li>
                                    <li>
                                        <strong>Endpoint URL:</strong><br />
                                        <code className="bg-white dark:bg-slate-900 px-2 py-1 rounded text-xs block mt-1">
                                            {window.location.origin}/api/functions/stripeWebhookHandler
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => copyToClipboard(`${window.location.origin}/api/functions/stripeWebhookHandler`, 'webhook-url')}
                                        >
                                            {copiedCode === 'webhook-url' ? <CheckCircle className="w-4 h-4 text-green-600 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                            URL kopieren
                                        </Button>
                                    </li>
                                    <li>
                                        <strong>Events zu abonnieren:</strong>
                                        <ul className="ml-6 mt-2 space-y-1">
                                            <li>✅ <code>checkout.session.completed</code></li>
                                            <li>✅ <code>customer.subscription.updated</code></li>
                                            <li>✅ <code>customer.subscription.deleted</code></li>
                                            <li>✅ <code>invoice.payment_succeeded</code></li>
                                            <li>✅ <code>invoice.payment_failed</code></li>
                                        </ul>
                                    </li>
                                    <li>Speichern und kopiere das <strong>Signing Secret</strong> (beginnt mit <code>whsec_</code>)</li>
                                    <li>Füge es als <code>STRIPE_WEBHOOK_SECRET</code> in den Environment Variables ein</li>
                                </ol>
                            </div>

                            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <AlertDescription className="text-green-800 dark:text-green-200">
                                    <strong>Glückwunsch!</strong> Wenn Sie alle Schritte abgeschlossen haben, ist Ihre Stripe-Integration vollständig eingerichtet und funktionsbereit!
                                </AlertDescription>
                            </Alert>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(3)}
                            >
                                Zurück
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/pricing'}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Setup abschließen & testen
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
