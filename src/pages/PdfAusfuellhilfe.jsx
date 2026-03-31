import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Copy, 
    Check, 
    ArrowLeft, 
    ExternalLink, 
    FileText,
    Download,
    Lightbulb
} from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function PdfAusfuellhilfe() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({});
    const [copiedField, setCopiedField] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const applicationType = searchParams.get('type') || 'buergergeld';
    
    const applicationInfo = {
        buergergeld: {
            title: 'Bürgergeld-Hauptantrag',
            pdfUrl: 'https://www.arbeitsagentur.de/datei/antrag-sgb2_ba042689.pdf',
            fields: [
                { label: 'Vorname', key: 'vorname', required: true },
                { label: 'Nachname', key: 'nachname', required: true },
                { label: 'Geburtsdatum', key: 'geburtsdatum', required: true },
                { label: 'Straße', key: 'strasse', required: true },
                { label: 'Hausnummer', key: 'hausnummer', required: true },
                { label: 'PLZ', key: 'plz', required: true },
                { label: 'Ort', key: 'ort', required: true },
                { label: 'Familienstand', key: 'familienstand', required: false },
                { label: 'Beschäftigungsstatus', key: 'beschaeftigungsstatus', required: false },
                { label: 'Monatl. Nettoeinkommen', key: 'monatliches_nettoeinkommen', required: true },
                { label: 'Anzahl Kinder', key: 'kinder_anzahl', required: false },
                { label: 'IBAN', key: 'bankverbindung_iban', required: true }
            ]
        },
        arbeitslosengeld: {
            title: 'Arbeitslosengeld I',  
            pdfUrl: 'https://www.arbeitsagentur.de/vor-ort/datei/eservice-anleitung-arbeitslosengeld_ba108727.pdf',
            fields: [
                { label: 'Vorname', key: 'vorname', required: true },
                { label: 'Nachname', key: 'nachname', required: true },
                { label: 'Geburtsdatum', key: 'geburtsdatum', required: true },
                { label: 'PLZ', key: 'plz', required: true },
                { label: 'Ort', key: 'ort', required: true },
                { label: 'Letzter Arbeitgeber', key: 'letzter_arbeitgeber', required: false }
            ]
        },
        // NEW: Support for all the new application types
        kindergeld: {
            title: 'Kindergeld-Antrag',
            pdfUrl: 'https://www.arbeitsagentur.de/datei/kindergeldantrag_ba013086.pdf',
            fields: [
                { label: 'Vorname', key: 'vorname', required: true },
                { label: 'Nachname', key: 'nachname', required: true },
                { label: 'Geburtsdatum', key: 'geburtsdatum', required: true },
                { label: 'PLZ', key: 'plz', required: true },
                { label: 'Ort', key: 'ort', required: true },
                { label: 'Anzahl Kinder', key: 'kinder_anzahl', required: true },
                { label: 'IBAN', key: 'bankverbindung_iban', required: true }
            ]
        },
        wohngeld: {
            title: 'Wohngeld-Antrag',
            pdfUrl: 'https://www.bmas.de/SharedDocs/Downloads/DE/Formulare/wohngeldantrag.pdf',
            fields: [
                { label: 'Vorname', key: 'vorname', required: true },
                { label: 'Nachname', key: 'nachname', required: true },
                { label: 'Geburtsdatum', key: 'geburtsdatum', required: true },
                { label: 'Straße', key: 'strasse', required: true },
                { label: 'Hausnummer', key: 'hausnummer', required: true },
                { label: 'PLZ', key: 'plz', required: true },
                { label: 'Ort', key: 'ort', required: true },
                { label: 'Monatliches Nettoeinkommen', key: 'monatliches_nettoeinkommen', required: true },
                { label: 'Kaltmiete', key: 'monatliche_miete_kalt', required: true }
            ]
        },
        bafoeg: {
            title: 'BAföG-Antrag',
            pdfUrl: 'https://www.bafög.de/bafoeg/de/antrag-stellen/formblatt-1---antrag-auf-ausbildungsfoerderung/formblatt-1---antrag-auf-ausbildungsfoerderung_node.html',
            fields: [
                { label: 'Vorname', key: 'vorname', required: true },
                { label: 'Nachname', key: 'nachname', required: true },
                { label: 'Geburtsdatum', key: 'geburtsdatum', required: true },
                { label: 'PLZ', key: 'plz', required: true },
                { label: 'Ort', key: 'ort', required: true },
                { label: 'Familienstand', key: 'familienstand', required: false }
            ]
        }
    };

    const currentApp = applicationInfo[applicationType] || applicationInfo.buergergeld;

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                
                // Prepare form data for easy access
                const data = {
                    vorname: currentUser.vorname || '',
                    nachname: currentUser.nachname || '',
                    geburtsdatum: currentUser.geburtsdatum || '',
                    strasse: currentUser.lebenssituation?.wohnadresse?.strasse || '',
                    hausnummer: currentUser.lebenssituation?.wohnadresse?.hausnummer || '',
                    plz: currentUser.lebenssituation?.wohnadresse?.plz || '',
                    ort: currentUser.lebenssituation?.wohnadresse?.ort || '',
                    familienstand: currentUser.lebenssituation?.familienstand || '',
                    beschaeftigungsstatus: currentUser.lebenssituation?.beschaeftigungsstatus || '',
                    monatliches_nettoeinkommen: currentUser.lebenssituation?.monatliches_nettoeinkommen || '',
                    kinder_anzahl: currentUser.lebenssituation?.kinder_anzahl || 0,
                    bankverbindung_iban: currentUser.lebenssituation?.bankverbindung?.iban || '',
                    letzter_arbeitgeber: currentUser.lebenssituation?.arbeitgeber_daten?.name || '',
                    monatliche_miete_kalt: currentUser.lebenssituation?.monatliche_miete_kalt || ''
                };
                
                setFormData(data);
            } catch (error) {
                console.error('Failed to load user data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadUserData();
    }, []);

    const copyToClipboard = async (text, fieldKey) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldKey);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    const openPdfInNewTab = () => {
        window.open(currentApp.pdfUrl, '_blank', 'noopener,noreferrer');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <FileText className="w-12 h-12 animate-pulse mx-auto mb-4 text-blue-600" />
                            <p className="text-slate-700 dark:text-slate-300">Ausfüllhilfe wird geladen...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => navigate(createPageUrl(`Antraege`))}
                        className="shadow-md hover:shadow-lg transition-all"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Zurück zur Übersicht
                    </Button>
                    
                    <div className="text-center">
                        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white">
                            🤖 Intelligente PDF-Ausfüllhilfe
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            {currentApp.title} - Ihre Daten zum Kopieren bereit
                        </p>
                    </div>
                    
                    <Button onClick={openPdfInNewTab} className="bg-blue-600 hover:bg-blue-700">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        PDF öffnen
                    </Button>
                </div>

                {/* Instructions */}
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <Lightbulb className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">
                                    🚀 So funktioniert's:
                                </h3>
                                <ol className="text-blue-700 dark:text-blue-300 text-sm space-y-1 list-decimal list-inside">
                                    <li>Klicken Sie auf "PDF öffnen" um das Formular in einem neuen Tab zu öffnen</li>
                                    <li>Klicken Sie hier auf die Kopieren-Buttons um Ihre Daten zu kopieren</li>
                                    <li>Wechseln Sie zum PDF-Tab und fügen Sie die Daten in die entsprechenden Felder ein</li>
                                    <li>Speichern Sie das ausgefüllte PDF und reichen Sie es ein</li>
                                </ol>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content: Data Fields + PDF */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left Side: Copy-Paste Data */}
                    <div className="space-y-6">
                        <Card className="shadow-xl border-none bg-white/80 dark:bg-slate-800/80">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Copy className="w-5 h-5" />
                                    Ihre Daten zum Kopieren
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {currentApp.fields.map((field) => {
                                    const value = formData[field.key] || '';
                                    const hasValue = value && value.toString().trim() !== '' && value !== '0';
                                    
                                    return (
                                        <div key={field.key} className="space-y-2">
                                            <Label className={`text-slate-700 dark:text-slate-300 ${field.required ? 'font-semibold' : ''}`}>
                                                {field.label} {field.required && <span className="text-red-500">*</span>}
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={hasValue ? value : 'Noch nicht hinterlegt'}
                                                    readOnly
                                                    className={`flex-1 ${
                                                        hasValue 
                                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' 
                                                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                                                    }`}
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => copyToClipboard(value, field.key)}
                                                    disabled={!hasValue}
                                                    className="flex-shrink-0"
                                                >
                                                    {copiedField === field.key ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                            {!hasValue && field.required && (
                                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                                    Dieses Feld ist erforderlich - bitte vervollständigen Sie Ihr Profil.
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button 
                                onClick={openPdfInNewTab} 
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3"
                                size="lg"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                PDF öffnen & ausfüllen
                            </Button>
                            
                            <Button 
                                variant="outline"
                                onClick={() => navigate(createPageUrl('Lebenslagen'))}
                                className="w-full border-slate-300 dark:border-slate-600"
                            >
                                Fehlende Daten im Profil ergänzen
                            </Button>
                        </div>
                    </div>

                    {/* Right Side: PDF Download (Desktop only) */}
                    <div className="hidden lg:block">
                        <Card className="shadow-xl border-none bg-white/80 dark:bg-slate-800/80 h-full">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    PDF-Formular
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="text-center space-y-4 py-12">
                                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center">
                                        <FileText className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {currentApp.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                                        Das PDF-Formular kann aus Sicherheitsgründen nicht eingebettet werden.
                                        Öffnen Sie es in einem neuen Tab, um es auszufüllen.
                                    </p>
                                    <div className="flex flex-col gap-3 pt-4">
                                        <Button 
                                            onClick={() => window.open(currentApp.pdfUrl, '_blank')}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            <ExternalLink className="w-5 h-5 mr-2" />
                                            PDF in neuem Tab öffnen
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = currentApp.pdfUrl;
                                                link.download = `${applicationType}-antrag.pdf`;
                                                link.click();
                                            }}
                                            className="px-8 py-6 text-lg rounded-xl border-2"
                                        >
                                            <Download className="w-5 h-5 mr-2" />
                                            PDF herunterladen
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}