
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Foerderleistung } from "@/api/entities";
import { User } from "@/api/entities";
import { Anspruchspruefung } from "@/api/entities";
import { checkEligibility } from "@/components/eligibilityEngine";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    ArrowLeft, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    ExternalLink,
    User as UserIcon,
    FileText,
    Euro,
    Clock
} from "lucide-react";

const getStatusIcon = (eligible) => {
    if (eligible === true) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (eligible === false) return <XCircle className="w-6 h-6 text-red-600" />;
    return <AlertTriangle className="w-6 h-6 text-amber-600" />;
};

const getStatusColor = (eligible) => {
    if (eligible === true) return "border-green-200 bg-green-50";
    if (eligible === false) return "border-red-200 bg-red-50";
    return "border-amber-200 bg-amber-50";
};

const getStatusText = (eligible) => {
    if (eligible === true) return "Anspruch wahrscheinlich";
    if (eligible === false) return "Kein Anspruch";
    return "Weitere Prüfung nötig";
};

export default function Pruefung() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const leistungTyp = searchParams.get('type');
    
    const [leistung, setLeistung] = useState(null);
    const [user, setUser] = useState(null);
    const [pruefungsErgebnis, setPruefungsErgebnis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!leistungTyp) {
                    navigate(createPageUrl("Dashboard"));
                    return;
                }

                const [currentUser, allLeistungen] = await Promise.all([
                    User.me(),
                    Foerderleistung.list()
                ]);

                const leistungData = allLeistungen.find(l => l.typ === leistungTyp);
                
                if (!leistungData) {
                    console.error("Leistung nicht gefunden:", leistungTyp);
                    navigate(createPageUrl("Dashboard"));
                    return;
                }

                setUser(currentUser);
                setLeistung(leistungData);
                
                // Führe Anspruchsprüfung durch
                const ergebnis = checkEligibility(leistungData, currentUser);
                setPruefungsErgebnis(ergebnis);
                
            } catch (error) {
                console.error("Fehler beim Laden der Daten:", error);
            }
            setIsLoading(false);
        };
        
        loadData();
    }, [leistungTyp, navigate]);

    const saveValidationResult = async () => {
        if (!user || !leistung || !pruefungsErgebnis) return;
        
        setIsSaving(true);
        try {
            await Anspruchspruefung.create({
                user_id: user.id,
                anspruchs_art: leistung.typ,
                status: 'abgeschlossen',
                eingaben: user.lebenssituation,
                ergebnis_status: pruefungsErgebnis.eligible === true 
                    ? 'anspruch_wahrscheinlich' 
                    : pruefungsErgebnis.eligible === false 
                        ? 'anspruch_unwahrscheinlich'
                        : 'weitere_pruefung_noetig',
                ergebnis_details: {
                    begruendung: pruefungsErgebnis.reason,
                    confidence: pruefungsErgebnis.confidence,
                    score: pruefungsErgebnis.amount,
                    checks: pruefungsErgebnis.details
                }
            });
        } catch (error) {
            console.error("Fehler beim Speichern:", error);
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
                <Card className="w-96">
                    <CardContent className="p-6 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p>Lade Förderleistung...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!leistung) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
                <Card className="w-96">
                    <CardContent className="p-6 text-center">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Förderleistung nicht gefunden</h2>
                        <p className="text-slate-600 mb-4">Die angeforderte Förderleistung konnte nicht geladen werden.</p>
                        <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
                            Zurück zum Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="shadow-md"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">{leistung.titel}</h1>
                        <p className="text-slate-600">{leistung.kurzbeschreibung}</p>
                    </div>
                </div>

                {/* Prüfungsergebnis */}
                {pruefungsErgebnis && (
                    <Card className={`border-2 shadow-lg ${getStatusColor(pruefungsErgebnis.eligible)}`}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(pruefungsErgebnis.eligible)}
                                    <div>
                                        <CardTitle className="text-xl">
                                            {getStatusText(pruefungsErgebnis.eligible)}
                                        </CardTitle>
                                        <p className="text-slate-600 mt-1">
                                            Konfidenz: {pruefungsErgebnis.confidence}
                                        </p>
                                    </div>
                                </div>
                                {pruefungsErgebnis.amount > 0 && (
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                                            <Euro className="w-5 h-5" />
                                            {pruefungsErgebnis.amount}
                                        </div>
                                        <div className="text-sm text-slate-600">pro Monat</div>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    {pruefungsErgebnis.reason}
                                </AlertDescription>
                            </Alert>

                            {/* Fehlende Daten */}
                            {pruefungsErgebnis.missingData && pruefungsErgebnis.missingData.length > 0 && (
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <h4 className="font-semibold text-amber-800 mb-2">
                                        Für eine genauere Prüfung benötigen wir:
                                    </h4>
                                    <ul className="text-sm text-amber-700 space-y-1">
                                        {pruefungsErgebnis.missingData.map((item, idx) => (
                                            <li key={idx}>• {item}</li>
                                        ))}
                                    </ul>
                                    <Button
                                        variant="outline" 
                                        size="sm" 
                                        className="mt-3"
                                        onClick={() => navigate(createPageUrl("Lebenslagen"))}
                                    >
                                        <UserIcon className="w-4 h-4 mr-2" />
                                        Profil vervollständigen
                                    </Button>
                                </div>
                            )}

                            {/* Details der Prüfung */}
                            {pruefungsErgebnis.details && pruefungsErgebnis.details.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-slate-800 mb-2">Prüfungsdetails:</h4>
                                    <div className="space-y-2">
                                        {pruefungsErgebnis.details.map((detail, idx) => (
                                            <div key={idx} className="text-sm p-3 bg-white/70 rounded border">
                                                <div className="font-medium text-slate-800">{detail.reason}</div>
                                                {detail.missingData && detail.missingData.length > 0 && (
                                                    <div className="text-slate-600 mt-1">
                                                        Fehlende Daten: {detail.missingData.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <Button onClick={saveValidationResult} disabled={isSaving}>
                                    {isSaving ? (
                                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <FileText className="w-4 h-4 mr-2" />
                                    )}
                                    Ergebnis speichern
                                </Button>
                                
                                {leistung.antrag_url && pruefungsErgebnis.eligible === true && (
                                    <Button 
                                        variant="outline" 
                                        onClick={() => window.open(leistung.antrag_url, '_blank')}
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Antrag stellen
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Förderleistung Details */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Details zur Förderleistung
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2">Beschreibung</h4>
                                <p className="text-slate-600 mb-4">{leistung.vollbeschreibung || leistung.kurzbeschreibung}</p>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <Badge variant="outline">{leistung.kategorie}</Badge>
                                    {leistung.bundesweit && <Badge variant="outline">Bundesweit</Badge>}
                                    {leistung.automatisierbar && <Badge className="bg-green-100 text-green-800">Auto-Prüfung</Badge>}
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2">Antragsinformationen</h4>
                                <div className="space-y-2 text-sm">
                                    <div><strong>Antragsstelle:</strong> {leistung.antragsstelle}</div>
                                    <div><strong>Bearbeitungszeit:</strong> {leistung.bearbeitungszeit}</div>
                                    {leistung.rechtsgrundlage && (
                                        <div><strong>Rechtsgrundlage:</strong> {leistung.rechtsgrundlage}</div>
                                    )}
                                </div>
                                
                                <div className="mt-4 space-y-2">
                                    {leistung.info_url && (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => window.open(leistung.info_url, '_blank')}
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Mehr Informationen
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Voraussetzungen */}
                        {leistung.voraussetzungen_text && leistung.voraussetzungen_text.length > 0 && (
                            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                                <h4 className="font-semibold text-slate-800 mb-2">Voraussetzungen</h4>
                                <ul className="text-sm text-slate-600 space-y-1">
                                    {leistung.voraussetzungen_text.map((voraussetzung, idx) => (
                                        <li key={idx}>• {voraussetzung}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
