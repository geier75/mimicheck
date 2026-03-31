
import { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import PricingCard from '@/components/ui/PricingCard';
import { Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createStripeCheckoutSession } from '@/api/functions';
import { createCustomerPortalSession } from '@/api/functions';

const pricingPlans = [
    {
        id: 'free',
        title: 'Basis-Check',
        subtitle: 'Für den gelegentlichen Überblick',
        price: '€0',
        features: [
            '1x Förderprüfung (alle 3 Monate)',
            '1x Nebenkostenprüfung (alle 6 Monate)',
            'Basis KI-Assistent (5 Fragen/Tag)',
            'Ergebnisse nur anzeigen (kein Export)'
        ],
        recommended: false
    },
    {
        id: 'premium',
        title: 'Staatshilfen+',
        subtitle: 'Die beste Wahl für die meisten Nutzer',
        price: '€14.99',
        features: [
            'Unbegrenzte Förderprüfungen',
            'Unbegrenzte Nebenkostenprüfungen',
            'Priority KI-Assistent',
            'PDF-Reports & Musterbriefe',
            'Automatische Antragsassistenz',
            'Widerspruchs-Wizard'
        ],
        recommended: true
    },
    {
        id: 'pro',
        title: 'Haushalt-Optimierer',
        subtitle: 'Für Familien und Power-User',
        price: '€29.99',
        features: [
            'Alle Features von Premium',
            'Familienmitglieder verwalten (bis 4 Profile)',
            'Rechtliche Erstberatung (1x / Monat)',
            'Steueroptimierungs-KI',
            'Persönlicher KI-Agent für komplexe Fälle',
            'WhatsApp & Telefon-Support'
        ],
        recommended: false
    }
];

export default function Pricing() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [showPortalSetupGuide, setShowPortalSetupGuide] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        User.me().then(user => {
            setUser(user);
            setIsLoading(false);
        }).catch(() => setIsLoading(false));

        // Check for payment status in URL
        const paymentStatus = searchParams.get('payment');
        if (paymentStatus === 'success') {
            setError(null);
            setTimeout(() => navigate(createPageUrl('Dashboard')), 2000);
        } else if (paymentStatus === 'cancelled') {
            setError('Zahlung wurde abgebrochen. Sie können es jederzeit erneut versuchen.');
        }
    }, [searchParams, navigate]);

    const handleSelectPlan = async (planId) => {
        if (!user) {
            await User.login();
            return;
        }

        if (planId === 'free') {
            handleManageSubscription();
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // FIXED: Direct function import with automatic auth
            const response = await createStripeCheckoutSession({
                planId,
                successUrl: `${window.location.origin}${createPageUrl('Pricing')}?payment=success`,
                cancelUrl: `${window.location.origin}${createPageUrl('Pricing')}?payment=cancelled`
            });

            if (!response.data) {
                throw new Error('Keine Antwort vom Server erhalten');
            }

            const data = response.data;

            if (data.error) {
                throw new Error(data.error);
            }

            if (!data.checkoutUrl) {
                throw new Error('Keine Checkout URL erhalten');
            }

            // Redirect to Stripe Checkout
            window.location.href = data.checkoutUrl;

        } catch (error) {
            console.error('Error creating checkout session:', error);
            setError(`Fehler beim Starten der Zahlung: ${error.message}. Bitte versuchen Sie es erneut.`);
            setIsProcessing(false);
        }
    };

    const handleManageSubscription = async () => {
        if (!user || !user.stripe_customer_id) {
            setError('Keine aktive Subscription gefunden.');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setShowPortalSetupGuide(false); // Reset guide visibility on new attempt

        try {
            // FIXED: Direct function import
            const response = await createCustomerPortalSession({
                returnUrl: `${window.location.origin}${createPageUrl('Pricing')}`
            });

            if (!response.data) {
                throw new Error('Keine Antwort vom Server erhalten');
            }

            const data = response.data;

            if (data.error === 'STRIPE_CUSTOMER_PORTAL_NOT_CONFIGURED') {
                setShowPortalSetupGuide(true);
                setError(data.message);
                setIsProcessing(false);
                return;
            }

            if (data.error) {
                throw new Error(data.error);
            }

            if (!data.portalUrl) {
                throw new Error('Keine Portal URL erhalten');
            }

            window.location.href = data.portalUrl;

        } catch (error) {
            console.error('Error creating portal session:', error);
            setError(`Fehler beim Öffnen der Abo-Verwaltung: ${error.message}`);
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white humanistic-serif">
                        Der perfekte Plan für Sie
                    </h1>
                    <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        Wählen Sie den Plan, der am besten zu Ihren Bedürfnissen passt und maximieren Sie Ihre Ansprüche und Ersparnisse.
                    </p>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Customer Portal Setup Guide */}
                {showPortalSetupGuide && (
                    <Alert className="mb-8 max-w-2xl mx-auto bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 dark:text-blue-300">
                            <strong>📋 Stripe Customer Portal aktivieren:</strong><br />
                            <ol className="list-decimal ml-5 mt-2 space-y-1">
                                <li>Öffnen Sie: <a href="https://dashboard.stripe.com/settings/billing/portal" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Stripe Customer Portal Settings</a></li>
                                <li>Klicken Sie auf <strong>"Activate test link"</strong> (Test-Modus) oder <strong>"Activate"</strong> (Live-Modus)</li>
                                <li>Speichern Sie die Einstellungen</li>
                                <li>Fertig! Versuchen Sie es dann erneut.</li>
                            </ol>
                        </AlertDescription>
                    </Alert>
                )}

                {searchParams.get('payment') === 'success' && (
                    <Alert className="mb-8 max-w-2xl mx-auto bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <AlertDescription className="text-green-800 dark:text-green-300">
                            ✅ Zahlung erfolgreich! Ihr Abonnement wurde aktiviert. Sie werden zum Dashboard weitergeleitet...
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
                    {pricingPlans.map(plan => (
                        <PricingCard 
                            key={plan.id}
                            plan={plan}
                            onSelect={handleSelectPlan}
                            isCurrentPlan={user?.subscription_tier === plan.id}
                            isLoading={isProcessing}
                        />
                    ))}
                </div>

                {user && user.subscription_tier !== 'free' && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={handleManageSubscription}
                            disabled={isProcessing}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                            Abonnement verwalten (Kündigung, Zahlungsmethode ändern, etc.)
                        </button>
                    </div>
                )}

                <div className="mt-16 text-center">
                    <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Sichere Zahlung mit Stripe
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Jederzeit kündbar
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            DSGVO-konform
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
