
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User } from '@/api/entities';
import DigitalerAntragsAssistent from '@/components/antrag/DigitalerAntragsAssistent';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bot, AlertTriangle, Download, FileText, User as UserIcon } from 'lucide-react';
import AgenticAIFeatures from '@/components/antrag/AgenticAIFeatures';
import AutoPdfGenerator from '@/components/antrag/AutoPdfGenerator'; // Import the new AutoPdfGenerator

// NEW: Form filling assistant for application types
const FormFillingAssistant = ({ applicationType }) => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        User.me().then(user => {
            setUser(user);
            // Pre-fill form data based on user profile
            if (user?.lebenssituation) {
                setFormData({
                    vorname: user.vorname || '',
                    nachname: user.nachname || '',
                    geburtsdatum: user.geburtsdatum || '',
                    strasse: user.lebenssituation?.wohnadresse?.strasse || '',
                    hausnummer: user.lebenssituation?.wohnadresse?.hausnummer || '',
                    plz: user.lebenssituation?.wohnadresse?.plz || '',
                    ort: user.lebenssituation?.wohnadresse?.ort || '',
                    familienstand: user.lebenssituation?.familienstand || '',
                    beschaeftigungsstatus: user.lebenssituation?.beschaeftigungsstatus || '',
                    monatliches_nettoeinkommen: user.lebenssituation?.monatliches_nettoeinkommen || '',
                    kinder_anzahl: user.lebenssituation?.kinder_anzahl || 0,
                    bankverbindung_iban: user.lebenssituation?.bankverbindung?.iban || ''
                });
            }
            setIsLoading(false);
        }).catch(() => setIsLoading(false));
    }, []);

    const applicationInfo = {
        buergergeld: {
            title: 'Bürgergeld-Hauptantrag',
            description: 'Antrag auf Leistungen nach dem SGB II (Bürgergeld)',
            downloadUrl: 'https://www.arbeitsagentur.de/datei/antrag-sgb2_ba042689.pdf',
            color: 'from-red-500 to-orange-500'
        },
        arbeitslosengeld: {
            title: 'Arbeitslosengeld I',
            description: 'Antrag auf Arbeitslosengeld nach dem SGB III',
            downloadUrl: 'https://www.arbeitsagentur.de/vor-ort/datei/eservice-anleitung-arbeitslosengeld_ba108727.pdf',
            color: 'from-blue-500 to-indigo-500'
        }
    };

    const currentApp = applicationInfo[applicationType] || applicationInfo.buergergeld;

    if (isLoading) {
        return (
            <Card className="shadow-2xl border-none bg-white/80 dark:bg-slate-800/80">
                <CardContent className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Bot className="w-12 h-12 animate-pulse mx-auto mb-4 text-blue-600" />
                        <p className="text-slate-700 dark:text-slate-300">KI-Ausfüllhilfe wird geladen...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <Card className="shadow-xl border-none bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-blue-900/20">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentApp.color} flex items-center justify-center shadow-lg`}>
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                🤖 KI-Ausfüllhilfe
                            </CardTitle>
                            <p className="text-slate-600 dark:text-slate-300">
                                {currentApp.title} - Ihre Daten werden automatisch eingetragen
                            </p>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Profile completeness check */}
            {!user?.lebenssituation?.plz && (
                <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-2">
                                    Profil vervollständigen für bessere KI-Hilfe
                                </h3>
                                <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
                                    Für die bestmögliche Ausfüllhilfe sollten Sie zuerst Ihr Profil vervollständigen.
                                </p>
                                <Link to={createPageUrl('Lebenslagen')}>
                                    <Button className="bg-amber-600 hover:bg-amber-700 text-white text-sm">
                                        <UserIcon className="w-4 h-4 mr-2" />
                                        Jetzt vervollständigen
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* NEW: Auto PDF Generator - The Game Changer! */}
            {user && user.lebenssituation?.plz && (
                <AutoPdfGenerator 
                    user={user} 
                    applicationType={applicationType}
                />
            )}

            {/* Form Preview - Keep for users who want to see the data */}
            <Card className="shadow-xl border-none bg-white/80 dark:bg-slate-800/80">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white">
                        📋 Ihre Daten für das Formular
                    </CardTitle>
                    <p className="text-slate-600 dark:text-slate-300">
                        Diese Informationen werden automatisch in das PDF-Formular eingetragen
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Personal Data */}
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">👤 Persönliche Daten</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-slate-700 dark:text-slate-300">Vorname</Label>
                                <Input 
                                    value={formData.vorname} 
                                    readOnly 
                                    className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                                    placeholder="Noch nicht hinterlegt"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-700 dark:text-slate-300">Nachname</Label>
                                <Input 
                                    value={formData.nachname} 
                                    readOnly 
                                    className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                                    placeholder="Noch nicht hinterlegt"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-700 dark:text-slate-300">Geburtsdatum</Label>
                                <Input 
                                    value={formData.geburtsdatum} 
                                    readOnly 
                                    className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                                    placeholder="Noch nicht hinterlegt"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-700 dark:text-slate-300">Familienstand</Label>
                                <Input 
                                    value={formData.familienstand} 
                                    readOnly 
                                    className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                                    placeholder="Noch nicht hinterlegt"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Data */}
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">🏠 Adresse</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-slate-700 dark:text-slate-300">Straße & Nr.</Label>
                                <Input 
                                    value={`${formData.strasse} ${formData.hausnummer}`.trim()} 
                                    readOnly 
                                    className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                                    placeholder="Noch nicht hinterlegt"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-700 dark:text-slate-300">PLZ & Ort</Label>
                                <Input 
                                    value={`${formData.plz} ${formData.ort}`.trim()} 
                                    readOnly 
                                    className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                                    placeholder="Noch nicht hinterlegt"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Financial Data */}
                    {applicationType === 'buergergeld' && (
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">💰 Finanzielle Angaben</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-700 dark:text-slate-300">Monatl. Nettoeinkommen</Label>
                                    <Input 
                                        value={formData.monatliches_nettoeinkommen ? `${formData.monatliches_nettoeinkommen}€` : ''} 
                                        readOnly 
                                        className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="Noch nicht hinterlegt"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-700 dark:text-slate-300">Anzahl Kinder</Label>
                                    <Input 
                                        value={formData.kinder_anzahl || ''} 
                                        readOnly 
                                        className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons - Updated */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-slate-600">
                        <Link 
                            to={createPageUrl(`PdfAusfuellhilfe?type=${applicationType}`)}
                            className="flex-1"
                        >
                            <Button variant="outline" className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                                <Download className="w-4 h-4 mr-2" />
                                Manuelle Ausfüllhilfe
                            </Button>
                        </Link>
                        <Link to={createPageUrl('Lebenslagen')} className="flex-1">
                            <Button variant="outline" className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                                <UserIcon className="w-4 h-4 mr-2" />
                                Profil bearbeiten
                            </Button>
                        </Link>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/60 dark:border-blue-800/60">
                        <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-semibold text-blue-800 dark:text-blue-300 text-sm">
                                KI-Tipp
                            </span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Je vollständiger Ihr Profil, desto mehr Felder können automatisch ausgefüllt werden. 
                            In Zukunft wird unsere KI das Formular direkt für Sie ausfüllen können!
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default function AntragAssistent() {
    const [searchParams] = useSearchParams();
    const flow = searchParams.get('flow');
    const abrechnungId = searchParams.get('abrechnungId');
    const type = searchParams.get('type'); // NEW: Support for application type

    const renderContent = () => {
        // FIXED: Handle application type parameter
        if (type && (type === 'buergergeld' || type === 'arbeitslosengeld')) {
            return <FormFillingAssistant applicationType={type} />;
        }
        
        if (flow === 'widerspruch' && abrechnungId) {
            return <DigitalerAntragsAssistent abrechnungId={abrechnungId} />;
        }
        
        if (flow === 'agentic-ai-vision') {
            return <AgenticAIFeatures />;
        }
        
        // Fallback for invalid parameters
        return (
             <div className="text-center p-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4"/>
                <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-300">Ungültiger Prozess</h2>
                <p className="text-amber-700 dark:text-amber-300 mt-2">
                    Es wurde kein gültiger Assistenten-Flow angegeben. Bitte starten Sie den Prozess von einer entsprechenden Seite (z.B. dem Prüfbericht).
                </p>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <Link to={createPageUrl(type ? 'Antraege' : 'Bericht', abrechnungId ? { id: abrechnungId } : {})}>
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Zurück
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                     <Bot className="w-6 h-6 text-purple-600" />
                     <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Digitaler Assistent</h1>
                </div>
                {!type && (
                    <Link to={createPageUrl(`AntragAssistent?flow=agentic-ai-vision`)}>
                        <Button variant="ghost">KI-Vision</Button>
                    </Link>
                )}
            </div>
            
            {renderContent()}
        </div>
    );
}
