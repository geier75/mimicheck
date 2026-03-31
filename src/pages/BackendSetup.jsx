import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from '@/api/entities';
import { 
    CheckCircle, 
    XCircle, 
    Loader2, 
    RefreshCcw,
    Settings,
    Zap,
    Shield,
    AlertTriangle
} from 'lucide-react';

import BackendFunctionTemplates from '@/components/backend/BackendFunctionTemplates';

/**
 * BACKEND SETUP CONTROL PANEL
 * Zeigt Status aller Backend Components + ermöglicht Setup
 */
export default function BackendSetup() {
    const [user, setUser] = useState(null);
    const [setupStatus, setSetupStatus] = useState({
        loading: true,
        secrets: null,
        functions: null,
        stripe: null,
        overall: null
    });

    useEffect(() => {
        User.me().then(setUser).catch(console.error);
        validateSetup();
    }, []);

    const validateSetup = async () => {
        setSetupStatus(prev => ({ ...prev, loading: true }));

        try {
            const response = await fetch('/api/functions/validateStripeSetup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ check: 'all' })
            });

            const result = await response.json();

            setSetupStatus({
                loading: false,
                secrets: result.checks || {},
                stripe: result.success,
                overall: result.success,
                message: result.message
            });
        } catch (error) {
            console.error('Validation failed:', error);
            setSetupStatus({
                loading: false,
                secrets: null,
                stripe: false,
                overall: false,
                message: 'Backend Function nicht erreichbar - bitte zuerst erstellen!'
            });
        }
    };

    const StatusIndicator = ({ status, label }) => (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border">
            <span className="font-medium">{label}</span>
            {status === null ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : status ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
                <XCircle className="w-5 h-5 text-red-600" />
            )}
        </div>
    );

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Only admins can access this page
    if (user.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <Shield className="w-6 h-6" />
                            Zugriff verweigert
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Diese Seite ist nur für Administratoren zugänglich.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Settings className="w-8 h-8" />
                        Backend Setup & Control
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Vollständige Konfiguration aller Backend Functions und Services
                    </p>
                </div>
                <Button 
                    onClick={validateSetup}
                    disabled={setupStatus.loading}
                    variant="outline"
                >
                    {setupStatus.loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <RefreshCcw className="w-4 h-4 mr-2" />
                    )}
                    Status aktualisieren
                </Button>
            </div>

            {/* Overall Status */}
            <Card className={`border-2 ${
                setupStatus.overall === null ? 'border-blue-200' :
                setupStatus.overall ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 
                'border-red-500 bg-red-50 dark:bg-red-900/10'
            }`}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {setupStatus.overall === null ? (
                                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                            ) : setupStatus.overall ? (
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            ) : (
                                <AlertTriangle className="w-12 h-12 text-red-600" />
                            )}
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {setupStatus.overall === null ? 'Prüfe Setup...' :
                                     setupStatus.overall ? '✅ Backend vollständig konfiguriert!' :
                                     '⚠️ Setup unvollständig'}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mt-1">
                                    {setupStatus.message || 'Validierung läuft...'}
                                </p>
                            </div>
                        </div>
                        {setupStatus.overall && (
                            <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                                <Zap className="w-5 h-5 mr-2" />
                                Produktionsbereit
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Status Checks */}
            {setupStatus.secrets && (
                <Card>
                    <CardHeader>
                        <CardTitle>Environment Variables Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <StatusIndicator 
                            status={setupStatus.secrets.stripe_secret_key} 
                            label="STRIPE_SECRET_KEY" 
                        />
                        <StatusIndicator 
                            status={setupStatus.secrets.stripe_webhook_secret} 
                            label="STRIPE_WEBHOOK_SECRET" 
                        />
                        <StatusIndicator 
                            status={setupStatus.secrets.premium_price_id} 
                            label="STRIPE_PREMIUM_PRICE_ID" 
                        />
                        <StatusIndicator 
                            status={setupStatus.secrets.pro_price_id} 
                            label="STRIPE_PRO_PRICE_ID" 
                        />
                    </CardContent>
                </Card>
            )}

            {/* Setup Guide */}
            <Tabs defaultValue="functions" className="w-full">
                <TabsList>
                    <TabsTrigger value="functions">Backend Functions</TabsTrigger>
                    <TabsTrigger value="secrets">Environment Variables</TabsTrigger>
                    <TabsTrigger value="agent">Backend Agent</TabsTrigger>
                </TabsList>

                <TabsContent value="functions">
                    <BackendFunctionTemplates />
                </TabsContent>

                <TabsContent value="secrets">
                    <Card>
                        <CardHeader>
                            <CardTitle>Environment Variables einrichten</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert>
                                <AlertDescription>
                                    <ol className="list-decimal list-inside space-y-3">
                                        <li><strong>Gehen Sie zu Stripe Dashboard:</strong> https://dashboard.stripe.com</li>
                                        <li><strong>Erstellen Sie folgende Secrets:</strong>
                                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                                <li><code>STRIPE_SECRET_KEY</code> - API Keys → Reveal live key</li>
                                                <li><code>STRIPE_WEBHOOK_SECRET</code> - Developers → Webhooks → Add endpoint → Signing secret</li>
                                                <li><code>STRIPE_PREMIUM_PRICE_ID</code> - Products → Premium → Pricing → Copy Price ID</li>
                                                <li><code>STRIPE_PRO_PRICE_ID</code> - Products → Pro → Pricing → Copy Price ID</li>
                                            </ul>
                                        </li>
                                        <li><strong>Fügen Sie sie im Base44 Dashboard hinzu:</strong> Settings → Environment Variables</li>
                                    </ol>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="agent">
                    <Card>
                        <CardHeader>
                            <CardTitle>Backend Orchestrator Agent</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800 dark:text-green-300">
                                    ✅ Der Backend Orchestrator Agent wurde bereits erstellt und ist aktiv!
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <h3 className="font-semibold">Agent-Capabilities:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                    <li>Stripe Checkout Sessions koordinieren</li>
                                    <li>Webhook Events verarbeiten</li>
                                    <li>Customer Portal Sessions erstellen</li>
                                    <li>Setup-Validierung durchführen</li>
                                    <li>User Subscription Status synchronisieren</li>
                                    <li>Error Handling & Monitoring</li>
                                </ul>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Der Agent arbeitet vollautomatisch im Hintergrund. Keine weitere Konfiguration erforderlich.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}