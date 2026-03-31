import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    ExternalLink,
    Copy,
    Check,
    ArrowLeft,
    Chrome,
    AlertCircle,
    Sparkles,
    ChevronRight,
    Eye,
    EyeOff,
    Info
} from 'lucide-react';
import LoadingState from '@/components/ui/LoadingState';

// Behörden-URLs und Schritt-für-Schritt Anleitungen
const WEB_APPLICATIONS = {
    arbeitslosengeld: {
        title: 'Arbeitslosengeld I beantragen',
        url: 'https://www.arbeitsagentur.de/eservices',
        officialSource: 'Bundesagentur für Arbeit',
        fields: [
            { 
                step: 1, 
                name: 'Persönliche Daten',
                fields: [
                    { label: 'Vorname', key: 'vorname', hint: 'Ihr offizieller Vorname laut Personalausweis' },
                    { label: 'Nachname', key: 'nachname', hint: 'Ihr offizieller Nachname laut Personalausweis' },
                    { label: 'Geburtsdatum', key: 'geburtsdatum', hint: 'Format: TT.MM.JJJJ' },
                ]
            },
            {
                step: 2,
                name: 'Adresse',
                fields: [
                    { label: 'Straße', key: 'lebenssituation.wohnadresse.strasse' },
                    { label: 'Hausnummer', key: 'lebenssituation.wohnadresse.hausnummer' },
                    { label: 'PLZ', key: 'lebenssituation.wohnadresse.plz' },
                    { label: 'Ort', key: 'lebenssituation.wohnadresse.ort' },
                ]
            },
            {
                step: 3,
                name: 'Kontaktdaten',
                fields: [
                    { label: 'E-Mail', key: 'email' },
                    { label: 'Telefon', key: 'telefon', hint: 'Optional, aber empfohlen für Rückfragen' },
                ]
            },
            {
                step: 4,
                name: 'Bankverbindung',
                fields: [
                    { label: 'IBAN', key: 'lebenssituation.iban', hint: 'Für die Auszahlung des Arbeitslosengeldes' },
                ]
            }
        ],
        instructions: [
            '1. Klicken Sie auf "Zum Online-Antrag"',
            '2. Registrieren Sie sich oder melden Sie sich an',
            '3. Folgen Sie den Schritten - wir zeigen Ihnen die passenden Daten',
            '4. Kopieren Sie die Daten mit einem Klick in die Zwischenablage',
            '5. Fügen Sie sie auf der Webseite ein (Strg+V oder Rechtsklick → Einfügen)'
        ]
    },
    krankengeld: {
        title: 'Krankengeld beantragen',
        url: 'https://www.tk.de/service/app/2002870/krankengeld/krankengeld.app',
        officialSource: 'Techniker Krankenkasse (Beispiel)',
        fields: [
            {
                step: 1,
                name: 'Versichertendaten',
                fields: [
                    { label: 'Versichertennummer', key: 'versichertennummer', hint: 'Finden Sie auf Ihrer Versichertenkarte' },
                    { label: 'Vorname', key: 'vorname' },
                    { label: 'Nachname', key: 'nachname' },
                    { label: 'Geburtsdatum', key: 'geburtsdatum' },
                ]
            },
            {
                step: 2,
                name: 'Arbeitsunfähigkeit',
                fields: [
                    { label: 'Beginn der AU', key: 'au_beginn', hint: 'Datum auf dem Krankenschein' },
                    { label: 'Ende der AU', key: 'au_ende', hint: 'Voraussichtliches Ende' },
                ]
            },
            {
                step: 3,
                name: 'Bankverbindung',
                fields: [
                    { label: 'IBAN', key: 'lebenssituation.iban' },
                ]
            }
        ],
        instructions: [
            '1. Halten Sie Ihren Krankenschein (Arbeitsunfähigkeitsbescheinigung) bereit',
            '2. Öffnen Sie das Online-Portal Ihrer Krankenkasse',
            '3. Nutzen Sie die kopierbaren Daten unten',
            '4. Laden Sie den Krankenschein als Scan/Foto hoch',
            '5. Überprüfen Sie alle Angaben vor dem Absenden'
        ]
    }
};

export default function WebAssistent() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const type = searchParams.get('type');
    
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedField, setCopiedField] = useState(null);
    const [showSensitive, setShowSensitive] = useState({});
    const [applicationOpened, setApplicationOpened] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (error) {
                console.error('Fehler beim Laden des Users:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, []);

    const app = WEB_APPLICATIONS[type];

    if (!app) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Ungültiger Antragstyp. Bitte wählen Sie einen Antrag aus der Anträge-Seite.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (isLoading) {
        return <LoadingState message="Web-Assistent wird vorbereitet..." fullScreen />;
    }

    // Funktion zum Abrufen von Werten aus dem User-Profil
    const getFieldValue = (key) => {
        const keys = key.split('.');
        let value = user;
        for (const k of keys) {
            value = value?.[k];
        }
        return value || 'Nicht hinterlegt';
    };

    // Copy to Clipboard
    const copyToClipboard = async (value, fieldLabel) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(fieldLabel);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (error) {
            console.error('Fehler beim Kopieren:', error);
        }
    };

    // Behörden-Seite öffnen
    const openApplication = () => {
        window.open(app.url, '_blank', 'noopener,noreferrer');
        setApplicationOpened(true);
    };

    // Sensitive Daten anzeigen/verbergen
    const toggleSensitive = (fieldLabel) => {
        setShowSensitive(prev => ({
            ...prev,
            [fieldLabel]: !prev[fieldLabel]
        }));
    };

    const isSensitiveField = (key) => {
        return key.includes('iban') || key.includes('versichertennummer') || key.includes('steuer');
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => navigate(createPageUrl('Antraege'))}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zurück zur Übersicht
                </Button>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    <Chrome className="w-4 h-4 mr-2" />
                    Web-Assistent aktiv
                </Badge>
            </div>

            {/* Titel */}
            <Card className="shadow-xl border-none bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-green-900/20">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                            <Chrome className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                {app.title}
                            </CardTitle>
                            <p className="text-slate-600 dark:text-slate-300">
                                {app.officialSource} - Schritt-für-Schritt Begleitung
                            </p>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Warnung: Profil unvollständig */}
            {(!user?.lebenssituation?.plz || !user?.lebenssituation?.iban) && (
                <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/20">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription>
                        <strong>Profil vervollständigen empfohlen:</strong> Einige Felder können nicht automatisch ausgefüllt werden, 
                        da sie in Ihrem Profil fehlen. 
                        <Button 
                            variant="link" 
                            className="text-amber-700 dark:text-amber-300 p-0 h-auto ml-2"
                            onClick={() => navigate(createPageUrl('Lebenslagen'))}
                        >
                            Jetzt vervollständigen →
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Anleitung */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        So funktioniert's
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-2">
                        {app.instructions.map((instruction, index) => (
                            <li key={index} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                                <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>{instruction}</span>
                            </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>

            {/* Ihre Daten - Schritt für Schritt */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    Ihre kopierfertigen Daten
                </h2>

                {app.fields.map((section) => (
                    <Card key={section.step} className="shadow-lg">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                                    {section.step}
                                </div>
                                {section.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                {section.fields.map((field) => {
                                    const value = getFieldValue(field.key);
                                    const isMissing = value === 'Nicht hinterlegt';
                                    const isSensitive = isSensitiveField(field.key);
                                    const isVisible = showSensitive[field.label] || !isSensitive;

                                    return (
                                        <div key={field.label} className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                {field.label}
                                                {field.hint && (
                                                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                                                        ({field.hint})
                                                    </span>
                                                )}
                                            </label>
                                            <div className="flex gap-2">
                                                <div className={`flex-1 px-4 py-3 rounded-lg border ${
                                                    isMissing 
                                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' 
                                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                                }`}>
                                                    {isSensitive && !isVisible ? (
                                                        <span className="text-slate-400">••••••••</span>
                                                    ) : (
                                                        <span className="font-mono">{value}</span>
                                                    )}
                                                </div>
                                                {isSensitive && (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => toggleSensitive(field.label)}
                                                        className="flex-shrink-0"
                                                    >
                                                        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => copyToClipboard(value, field.label)}
                                                    disabled={isMissing}
                                                    className="flex-shrink-0"
                                                >
                                                    {copiedField === field.label ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Call-to-Action */}
            <Card className="shadow-xl border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardContent className="p-8 text-center">
                    {!applicationOpened ? (
                        <>
                            <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
                                Bereit zum Ausfüllen?
                            </h3>
                            <p className="text-green-700 dark:text-green-300 mb-6 max-w-2xl mx-auto">
                                Öffnen Sie jetzt die offizielle Webseite. Diese Seite bleibt geöffnet, 
                                damit Sie die Daten einfach kopieren können.
                            </p>
                            <Button
                                onClick={openApplication}
                                size="lg"
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg px-8 py-6"
                            >
                                <ExternalLink className="w-5 h-5 mr-2" />
                                Zum Online-Antrag
                            </Button>
                        </>
                    ) : (
                        <>
                            <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
                                Webseite geöffnet!
                            </h3>
                            <p className="text-green-700 dark:text-green-300 mb-6">
                                Wechseln Sie zum neuen Tab und füllen Sie das Formular aus. 
                                Sie können jederzeit hierher zurückkehren, um Daten zu kopieren.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Button
                                    onClick={openApplication}
                                    variant="outline"
                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Erneut öffnen
                                </Button>
                                <Button
                                    onClick={() => navigate(createPageUrl('Dashboard'))}
                                    variant="outline"
                                >
                                    Zum Dashboard
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Datenschutz-Hinweis */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Datenschutz:</strong> Ihre Daten werden nur in Ihrem Browser angezeigt und nicht an Dritte übertragen. 
                    Nur Sie können sie kopieren und in das Formular einfügen.
                </AlertDescription>
            </Alert>
        </div>
    );
}