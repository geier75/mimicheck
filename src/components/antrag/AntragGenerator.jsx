import { useState, useEffect } from 'react';
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
    Loader2, 
    Printer, 
    FileText, 
    AlertTriangle,
    Download,
    CheckCircle,
    User,
    Home,
    Euro
} from "lucide-react";

export default function AntragGenerator({ leistung, user }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [antragHtml, setAntragHtml] = useState(null);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');

    useEffect(() => {
        if (leistung?.typ === 'wohngeld') {
            generateWohngeldAntrag();
        } else {
            generateGeneralAntrag();
        }
    }, [leistung, user]);

    const generateWohngeldAntrag = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            setCurrentStep('Formular wird analysiert...');
            setProgress(10);

            // Nutzer-Daten aufbereiten für Wohngeld-Antrag
            const antragsdaten = {
                // Persönliche Angaben
                familienname: extractLastName(user.full_name),
                vorname: extractFirstName(user.full_name),
                geburtsdatum: user.lebenssituation?.geburtsdatum || '',
                geschlecht: user.lebenssituation?.geschlecht || 'keine Angabe',
                familienstand: mapFamilienstand(user.lebenssituation?.familienstand),
                staatsangehoerigkeit: 'deutsch',
                
                // Wohnsituation
                antragstyp: 'Erstantrag',
                wohnung_strasse: extractStrasse(user.lebenssituation?.wohnadresse),
                wohnung_hausnummer: extractHausnummer(user.lebenssituation?.wohnadresse),
                wohnung_plz: user.lebenssituation?.plz || '',
                wohnung_ort: extractOrt(user.lebenssituation?.wohnadresse),
                
                // Haushaltsmitglieder
                haushaltsmitglieder_anzahl: user.lebenssituation?.haushaltsmitglieder_anzahl || 1,
                kinder_anzahl: user.lebenssituation?.kinder_anzahl || 0,
                
                // Einkommen
                monatliches_nettoeinkommen: user.lebenssituation?.monatliches_nettoeinkommen || 0,
                erwerbsstatus: mapErwerbsstatus(user.lebenssituation?.erwerbsstatus),
                
                // Miete
                monatliche_miete_gesamt: (user.lebenssituation?.monatliche_miete_kalt || 0) + 
                                       (user.lebenssituation?.monatliche_nebenkosten || 0),
                monatliche_miete_kalt: user.lebenssituation?.monatliche_miete_kalt || 0,
                nebenkosten: user.lebenssituation?.monatliche_nebenkosten || 0
            };

            setProgress(30);
            setCurrentStep('Formular wird ausgefüllt...');

            const response = await InvokeLLM({
                prompt: `
                Erstelle ein vollständiges, deutsches Wohngeld-Antragsformular als HTML-Dokument.
                Verwende die Struktur des offiziellen "Wohngeldantrag für den Mietzuschuss".

                Fülle das Formular mit folgenden Daten aus:
                ${JSON.stringify(antragsdaten, null, 2)}

                WICHTIGE VORGABEN:
                1. Erstelle ein vollständiges HTML-Dokument mit <!DOCTYPE html>
                2. Verwende ein professionelles, behördenähnliches Layout mit Inline-CSS
                3. Struktur: Kopfzeile mit "Wohngeldantrag für den Mietzuschuss"
                4. Alle Eingabefelder als Text (nicht als Formular-Inputs) ausfüllen
                5. Checkbox-Felder mit ☑ (ausgefüllt) oder ☐ (leer) darstellen
                6. Bereiche für Unterschrift und Datum vorsehen
                7. Platz für Behörden-Eingangsstempel
                8. Responsive Design für Druck optimiert

                Struktur der Seiten:
                - Seite 1: Persönliche Angaben, Wohnsituation
                - Seite 2: Haushaltsmitglieder
                - Seite 3: Einkommen und Ausgaben
                - Seite 4: Miete und Nebenkosten
                - Seite 5: Unterschrift und Nachweise

                Das Ergebnis muss druckfertig und rechtsgültig sein.
                `,
            });

            setProgress(80);
            setCurrentStep('PDF wird finalisiert...');
            
            setAntragHtml(response);
            setProgress(100);
            setCurrentStep('Fertig!');

        } catch (err) {
            console.error("Fehler bei der Wohngeld-Antragsgenerierung:", err);
            setError("Der Wohngeld-Antrag konnte nicht generiert werden. Bitte versuchen Sie es später erneut.");
        }
        
        setTimeout(() => setIsLoading(false), 500);
    };

    const generateGeneralAntrag = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            setCurrentStep('Antragsvorlage wird erstellt...');
            setProgress(20);

            const response = await InvokeLLM({
                prompt: `
                Erstelle ein vollständiges Antragsformular für "${leistung.titel}" als HTML-Dokument.

                Nutzerdaten:
                - Name: ${user.full_name}
                - E-Mail: ${user.email}
                - Lebenssituation: ${JSON.stringify(user.lebenssituation, null, 2)}

                Das HTML muss enthalten:
                1. Offiziellen Briefkopf der zuständigen Behörde
                2. Antragstitel: "Antrag auf ${leistung.titel}"
                3. Alle relevanten Felder basierend auf der Leistungsart ausgefüllt
                4. Rechtliche Hinweise und Datenschutzerklärung
                5. Unterschriftsfeld und Datum
                6. Druckoptimiertes Layout

                Beginne mit <!DOCTYPE html> und erstelle ein vollständiges, professionelles Dokument.
                `,
            });

            setProgress(100);
            setAntragHtml(response);

        } catch (err) {
            console.error("Fehler bei der Antragsgenerierung:", err);
            setError("Der Antrag konnte nicht generiert werden. Bitte versuchen Sie es später erneut.");
        }
        
        setIsLoading(false);
    };

    // Hilfsfunktionen für Datenaufbereitung
    const extractLastName = (fullName) => {
        const parts = fullName?.split(' ') || [''];
        return parts[parts.length - 1];
    };

    const extractFirstName = (fullName) => {
        const parts = fullName?.split(' ') || [''];
        return parts.slice(0, -1).join(' ') || parts[0];
    };

    const mapFamilienstand = (status) => {
        const mapping = {
            'ledig': 'ledig',
            'verheiratet': 'verheiratet',
            'geschieden': 'geschieden',
            'verwitwet': 'verwitwet',
            'in_partnerschaft': 'eingetragene Lebenspartnerschaft'
        };
        return mapping[status] || 'ledig';
    };

    const mapErwerbsstatus = (status) => {
        const mapping = {
            'angestellt': 'Arbeitnehmer/in',
            'selbstaendig': 'Selbständige/r',
            'arbeitslos': 'zurzeit arbeitslos',
            'rentner': 'Rentner/in oder Pensionär/in',
            'student': 'Auszubildende/r oder Student/in'
        };
        return mapping[status] || 'Arbeitnehmer/in';
    };

    const extractStrasse = (adresse) => {
        // Vereinfachte Adressextraktion
        return adresse?.split(',')[0]?.trim() || '';
    };

    const extractHausnummer = (adresse) => {
        const match = adresse?.match(/\d+[a-z]?/);
        return match ? match[0] : '';
    };

    const extractOrt = (adresse) => {
        const parts = adresse?.split(',') || [];
        return parts[parts.length - 1]?.trim() || '';
    };

    const handlePrint = () => {
        if (!antragHtml) return;
        
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(antragHtml);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const handleDownload = () => {
        if (!antragHtml) return;
        
        const blob = new Blob([antragHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${leistung.titel.replace(/\s+/g, '_')}_Antrag.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <Card className="mt-4 bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <div>
                                <p className="font-semibold text-blue-800">Antrag wird generiert...</p>
                                <p className="text-sm text-blue-700">{currentStep}</p>
                            </div>
                        </div>
                        
                        <Progress value={progress} className="h-3 bg-blue-200">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700"
                                style={{ width: `${progress}%` }}
                            />
                        </Progress>
                        
                        <div className="text-xs text-blue-600 text-center">
                            {progress}% abgeschlossen
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (error) {
        return (
            <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!antragHtml) {
        return null;
    }

    return (
        <div className="mt-6 space-y-6">
            {/* Erfolgreiche Generierung */}
            <Card className="border-green-200 bg-green-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        Antrag erfolgreich generiert!
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-green-600" />
                            <div>
                                <div className="font-semibold text-green-800">Persönliche Daten</div>
                                <div className="text-sm text-green-700">Automatisch ausgefüllt</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Home className="w-5 h-5 text-green-600" />
                            <div>
                                <div className="font-semibold text-green-800">Wohnsituation</div>
                                <div className="text-sm text-green-700">Aus Ihrem Profil</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Euro className="w-5 h-5 text-green-600" />
                            <div>
                                <div className="font-semibold text-green-800">Einkommen</div>
                                <div className="text-sm text-green-700">Berechnet & eingetragen</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Antrag-Vorschau */}
            <Card className="border-slate-200">
                <CardHeader className="bg-slate-50">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-slate-800">
                            Ihr {leistung.titel}-Antrag
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleDownload}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                HTML Download
                            </Button>
                            <Button
                                onClick={handlePrint}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Printer className="w-4 h-4" />
                                Drucken / PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Antrag-Vorschau im iframe */}
                    <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
                        <iframe
                            srcDoc={antragHtml}
                            className="w-full h-96 bg-white"
                            title={`${leistung.titel} Antragsvorschau`}
                            style={{ minHeight: '600px' }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Nächste Schritte */}
            <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                    <CardTitle className="text-amber-800 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Nächste Schritte
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-2 text-amber-800">
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-amber-600">1.</span>
                            <span>Antrag ausdrucken oder als PDF speichern</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-amber-600">2.</span>
                            <span>Alle erforderlichen Nachweise sammeln (Gehaltsnachweise, Mietvertrag, etc.)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-amber-600">3.</span>
                            <span>Antrag unterschreiben und datieren</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-amber-600">4.</span>
                            <span>
                                Per Post an {leistung.antragsstelle || 'die zuständige Behörde'} senden
                                {leistung.antrag_url && (
                                    <span> oder online unter{' '}
                                        <a 
                                            href={leistung.antrag_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            diesem Link
                                        </a> einreichen
                                    </span>
                                )}
                            </span>
                        </li>
                    </ol>
                </CardContent>
            </Card>

            {/* Rechtliche Hinweise */}
            <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <strong>Wichtiger Hinweis:</strong> Überprüfen Sie alle automatisch ausgefüllten Daten auf Richtigkeit, 
                    bevor Sie den Antrag einreichen. Falsche Angaben können rechtliche Konsequenzen haben.
                </AlertDescription>
            </Alert>
        </div>
    );
}