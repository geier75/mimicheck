import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from '@/api/entities';
import { 
    CheckCircle, 
    Copy,
    Loader2,
    AlertTriangle,
    Zap,
    Shield,
    ExternalLink,
    RefreshCw
} from 'lucide-react';

/**
 * AUTOMATISCHES STRIPE SETUP
 * Ein-Klick-Lösung für komplette Stripe Integration
 */
export default function StripeAutoSetup() {
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [setupComplete, setSetupComplete] = useState(false);
    const [setupResults, setSetupResults] = useState(null);
    const [error, setError] = useState(null);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [copiedVar, setCopiedVar] = useState(null);

    useEffect(() => {
        console.log('Loading user...');
        User.me()
            .then(user => {
                console.log('User loaded:', user);
                setUser(user);
                // Auto-generate webhook URL based on current domain
                const currentDomain = window.location.origin;
                setWebhookUrl(`${currentDomain}/api/functions/stripeWebhookHandler`);
            })
            .catch(error => {
                console.error('User load error:', error);
                setError('Fehler beim Laden des Benutzers');
            })
            .finally(() => {
                setIsLoadingUser(false);
            });
    }, []);

    const handleAutoSetup = async () => {
        if (!user || user.role !== 'admin') {
            setError('Sie benötigen Admin-Rechte für das Setup.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Import function dynamically to avoid build errors
            const { autoSetupStripe } = await import('@/api/functions');
            
            const response = await autoSetupStripe({ webhookUrl });

            if (!response.data) {
                throw new Error('Keine Antwort vom Server erhalten');
            }

            const result = response.data;

            if (!result.success && result.error) {
                throw new Error(result.error);
            }

            setSetupResults(result);
            setSetupComplete(result.success);

        } catch (err) {
            console.error('Auto Setup Error:', err);
            setError(err.message || 'Unbekannter Fehler beim Setup');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text, varName) => {
        navigator.clipboard.writeText(text);
        setCopiedVar(varName);
        setTimeout(() => setCopiedVar(null), 2000);
    };

    // LOADING STATE
    if (isLoadingUser) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                    <p className="text-slate-600 dark:text-slate-300">Lade Benutzer...</p>
                </div>
            </div>
        );
    }

    // NOT ADMIN
    if (!user || user.role !== 'admin') {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <Alert variant="destructive">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Zugriff verweigert</strong><br />
                        Nur Administratoren können das Stripe Setup durchführen.
                        {!user && <><br />Sie sind nicht angemeldet.</>}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
                    <Zap className="w-10 h-10 text-yellow-500" />
                    Automatisches Stripe Setup
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                    Ein Klick - Alles fertig! Products, Prices & Webhooks werden automatisch erstellt.
                </p>
            </div>

            {/* Status Check */}
            <Card className="border-2 border-blue-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Setup Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-slate-700 dark:text-slate-300">
                                STRIPE_SECRET_KEY gesetzt
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {setupComplete ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                            )}
                            <span className="text-slate-700 dark:text-slate-300">
                                Products & Prices {setupComplete ? 'erstellt' : 'ausstehend'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {setupComplete ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                            )}
                            <span className="text-slate-700 dark:text-slate-300">
                                Webhook {setupComplete ? 'konfiguriert' : 'ausstehend'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {setupComplete ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                            )}
                            <span className="text-slate-700 dark:text-slate-300">
                                Environment Variables {setupComplete ? 'bereit' : 'ausstehend'}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* CUSTOMER PORTAL MANUAL SETUP ANLEITUNG */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-400">
                        <AlertTriangle className="w-5 h-5" />
                        ⚠️ WICHTIG: Customer Portal manuell aktivieren
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-amber-800 dark:text-amber-300">
                        Das Stripe Customer Portal kann nicht automatisch aktiviert werden. 
                        Sie müssen es einmalig manuell im Stripe Dashboard aktivieren (dauert 30 Sekunden):
                    </p>
                    <ol className="list-decimal ml-5 space-y-2 text-amber-900 dark:text-amber-300">
                        <li className="font-semibold">Öffnen Sie das Stripe Dashboard</li>
                        <li>Gehen Sie zu: <strong>Settings → Billing → Customer portal</strong></li>
                        <li>Klicken Sie auf <strong>"Activate test link"</strong> (für Test-Modus) oder <strong>"Activate"</strong> (für Live-Modus)</li>
                        <li>Speichern Sie die Standardeinstellungen</li>
                        <li>✅ Fertig! Kunden können nun ihre Abos verwalten</li>
                    </ol>
                    <Button
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={() => window.open('https://dashboard.stripe.com/settings/billing/portal', '_blank')}
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Stripe Customer Portal öffnen
                    </Button>
                </CardContent>
            </Card>

            {/* Webhook URL Config */}
            {!setupComplete && (
                <Card>
                    <CardHeader>
                        <CardTitle>Webhook URL (automatisch generiert)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://ihre-domain.com/api/functions/stripeWebhookHandler"
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Diese URL wird automatisch in Stripe als Webhook Endpoint registriert
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Error Display */}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Fehler beim Setup:</strong><br />
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            {/* Main Action Button */}
            {!setupComplete && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-500">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <div className="text-6xl">🚀</div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Bereit für den automatischen Setup?
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                                Mit einem Klick werden in Stripe automatisch erstellt:
                            </p>
                            <ul className="text-left max-w-md mx-auto space-y-2">
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>Product: Staatshilfen+ Premium (€14.99/Monat)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>Product: Haushalt-Optimierer Pro (€29.99/Monat)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span>Webhook Endpoint für Subscription Events</span>
                                </li>
                            </ul>
                            
                            <Button
                                onClick={handleAutoSetup}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                        Setup läuft...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-6 h-6 mr-3" />
                                        Jetzt automatisch einrichten!
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Setup Results */}
            {setupResults && (
                <Card className="border-2 border-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-6 h-6" />
                            Setup Erfolgreich!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Steps Progress */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-slate-900 dark:text-white">Durchgeführte Schritte:</h4>
                            {setupResults.steps.map((step, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    {step.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    {step.status === 'skipped' && <RefreshCw className="w-5 h-5 text-blue-600" />}
                                    {step.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                                    {step.status === 'error' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                                    <div className="flex-1">
                                        <Badge className={
                                            step.status === 'success' ? 'bg-green-100 text-green-800' :
                                            step.status === 'skipped' ? 'bg-blue-100 text-blue-800' :
                                            step.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }>
                                            Step {step.step}
                                        </Badge>
                                        <span className="ml-3 text-slate-700 dark:text-slate-300">{step.message}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Environment Variables to Copy */}
                        {setupResults.environment_variables && Object.keys(setupResults.environment_variables).length > 0 && (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-500 rounded-lg p-6">
                                <h4 className="font-bold text-amber-900 dark:text-amber-400 text-lg mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    WICHTIG: Kopieren Sie diese Environment Variables ins Dashboard!
                                </h4>
                                <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
                                    Dashboard → Settings → Environment Variables → Add Variable
                                </p>
                                <div className="space-y-3">
                                    {Object.entries(setupResults.environment_variables).map(([key, value]) => (
                                        <div key={key} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-slate-900 dark:text-white">{key}</span>
                                                <Button
                                                    size="sm"
                                                    variant={copiedVar === key ? "default" : "outline"}
                                                    onClick={() => copyToClipboard(value, key)}
                                                >
                                                    {copiedVar === key ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Kopiert!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-4 h-4 mr-1" />
                                                            Kopieren
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                            <code className="text-xs bg-slate-100 dark:bg-slate-900 p-2 rounded block overflow-x-auto">
                                                {value}
                                            </code>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white"
                                    onClick={() => window.open('https://mimitech.com/dashboard', '_blank')}
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Dashboard öffnen und Variables hinzufügen
                                </Button>
                            </div>
                        )}

                        {/* Success Message */}
                        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800 dark:text-green-300">
                                <strong>✅ Stripe ist jetzt bereit!</strong><br />
                                Sobald Sie die Environment Variables hinzugefügt haben, ist die Pricing-Seite voll funktionsfähig.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}