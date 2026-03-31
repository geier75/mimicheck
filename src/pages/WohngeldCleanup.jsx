import { useState, useEffect } from 'react';
import { Foerderleistung } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
    Trash2, 
    CheckCircle, 
    AlertTriangle,
    Target,
    RefreshCw
} from "lucide-react";

export default function WohngeldCleanup() {
    const [wohngeldEntries, setWohngeldEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletionProgress, setDeletionProgress] = useState(0);
    const [cleanupComplete, setCleanupComplete] = useState(false);
    const [deletedCount, setDeletedCount] = useState(0);

    useEffect(() => {
        loadWohngeldEntries();
    }, []);

    const loadWohngeldEntries = async () => {
        setIsLoading(true);
        try {
            const allLeistungen = await Foerderleistung.list();
            
            // Finde alle Wohngeld-Varianten
            const wohngeldVariants = allLeistungen.filter(leistung => 
                leistung.titel.toLowerCase().includes('wohngeld') ||
                leistung.titel.toLowerCase().includes('wohngeld plus') ||
                (leistung.typ && leistung.typ.includes('wohngeld'))
            );
            
            console.log('Gefundene Wohngeld-Einträge:', wohngeldVariants);
            setWohngeldEntries(wohngeldVariants);
        } catch (error) {
            console.error("Fehler beim Laden:", error);
        }
        setIsLoading(false);
    };

    // Qualitäts-Score für Wohngeld-Einträge
    const calculateWohngeldScore = (leistung) => {
        let score = 0;
        
        // Vollständigkeit (0-10)
        if (leistung.kurzbeschreibung && leistung.kurzbeschreibung.length > 30) score += 3;
        if (leistung.vollbeschreibung && leistung.vollbeschreibung.length > 50) score += 2;
        if (leistung.voraussetzungen && leistung.voraussetzungen.length > 0) score += 2;
        if (leistung.maximale_hoehe && leistung.maximale_hoehe.includes('€')) score += 1;
        if (leistung.bearbeitungszeit) score += 1;
        if (leistung.antrag_url && leistung.antrag_url.includes('http')) score += 1;
        
        // Funktionalität (0-5)
        if (leistung.automatisierbar) score += 2;
        if (leistung.prioritaet && leistung.prioritaet >= 8) score += 2;
        if (leistung.bundesweit) score += 1;
        
        // Datenqualität (0-5)
        if (leistung.einkommensgrenzen) score += 3;
        if (leistung.wohnsituation_kriterien) score += 1;
        if (leistung.typ === 'wohngeld') score += 1; // Bevorzuge korrekte Typ-Zuordnung
        
        return score;
    };

    const getBestWohngeldEntry = () => {
        if (wohngeldEntries.length === 0) return null;
        
        const scored = wohngeldEntries.map(entry => ({
            ...entry,
            qualityScore: calculateWohngeldScore(entry)
        }));
        
        scored.sort((a, b) => b.qualityScore - a.qualityScore);
        return scored[0];
    };

    const getWorstWohngeldEntries = () => {
        if (wohngeldEntries.length <= 1) return [];
        
        const scored = wohngeldEntries.map(entry => ({
            ...entry,
            qualityScore: calculateWohngeldScore(entry)
        }));
        
        scored.sort((a, b) => b.qualityScore - a.qualityScore);
        return scored.slice(1); // Alle außer dem besten
    };

    const executeWohngeldCleanup = async () => {
        setIsDeleting(true);
        setDeletionProgress(0);
        
        const toDelete = getWorstWohngeldEntries();
        let deleted = 0;
        
        try {
            for (let i = 0; i < toDelete.length; i++) {
                const entry = toDelete[i];
                
                try {
                    await Foerderleistung.delete(entry.id);
                    deleted++;
                    console.log(`Gelöscht: ${entry.titel} (Score: ${entry.qualityScore})`);
                } catch (error) {
                    console.error(`Fehler beim Löschen von ${entry.titel}:`, error);
                }
                
                setDeletionProgress(Math.round(((i + 1) / toDelete.length) * 100));
            }
            
            setDeletedCount(deleted);
            setCleanupComplete(true);
            
            // Neu laden
            await loadWohngeldEntries();
            
        } catch (error) {
            console.error("Cleanup Fehler:", error);
        }
        
        setIsDeleting(false);
    };

    const bestEntry = getBestWohngeldEntry();
    const toDeleteEntries = getWorstWohngeldEntries();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2">Lade Wohngeld-Einträge...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Status Header */}
                <Card className={`border-2 ${wohngeldEntries.length > 1 ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'}`}>
                    <CardContent className="p-6 text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            {wohngeldEntries.length > 1 ? (
                                <AlertTriangle className="w-12 h-12 text-red-600" />
                            ) : (
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">
                                    Wohngeld-Bereinigung
                                </h1>
                                <p className={`text-lg ${wohngeldEntries.length > 1 ? 'text-red-700' : 'text-green-700'}`}>
                                    {wohngeldEntries.length > 1 
                                        ? `${wohngeldEntries.length} Duplikate gefunden!`
                                        : 'Bereinigung abgeschlossen - nur noch 1 Eintrag vorhanden'
                                    }
                                </p>
                            </div>
                        </div>
                        
                        {wohngeldEntries.length > 1 && (
                            <Button
                                onClick={executeWohngeldCleanup}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                            >
                                <Trash2 className="w-5 h-5 mr-2" />
                                {isDeleting ? 'Bereinige...' : `${toDeleteEntries.length} Duplikate löschen`}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Cleanup Success */}
                {cleanupComplete && deletedCount > 0 && (
                    <Alert className="border-green-400 bg-green-50">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <AlertDescription className="text-green-800 font-semibold">
                            ✅ ERFOLGREICH: {deletedCount} Wohngeld-Duplikate wurden gelöscht!<br />
                            Nur noch die beste Version ist in der Datenbank vorhanden.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Progress Bar */}
                {isDeleting && (
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                                <span className="font-semibold">Lösche Duplikate...</span>
                            </div>
                            <Progress value={deletionProgress} className="h-3" />
                            <div className="text-sm text-slate-600 mt-2">
                                {deletionProgress}% abgeschlossen
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Beste Version (wird behalten) */}
                {bestEntry && (
                    <Card className="border-green-400 bg-green-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800">
                                <CheckCircle className="w-5 h-5" />
                                Beste Version (wird behalten)
                                <Badge className="bg-green-600 text-white">
                                    Score: {calculateWohngeldScore(bestEntry)}/20
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <h3 className="font-bold text-lg">{bestEntry.titel}</h3>
                                <p className="text-slate-700">{bestEntry.kurzbeschreibung}</p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline">
                                        {bestEntry.maximale_hoehe || 'Keine Angabe'}
                                    </Badge>
                                    <Badge variant="outline">
                                        {bestEntry.bearbeitungszeit || 'Keine Angabe'}
                                    </Badge>
                                    {bestEntry.automatisierbar && (
                                        <Badge className="bg-blue-100 text-blue-800">Auto-Check</Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Duplikate (werden gelöscht) */}
                {toDeleteEntries.length > 0 && (
                    <Card className="border-red-400 bg-red-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-800">
                                <Trash2 className="w-5 h-5" />
                                Duplikate (werden gelöscht)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {toDeleteEntries.map((entry, index) => (
                                    <div key={entry.id} className="p-3 border border-red-300 rounded-lg bg-white">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-slate-800">{entry.titel}</h4>
                                                <p className="text-sm text-slate-600 line-clamp-2">
                                                    {entry.kurzbeschreibung || 'Keine Beschreibung'}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-red-600">
                                                Score: {calculateWohngeldScore(entry)}/20
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Bereinigungslogik */}
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-blue-800">Bereinigungslogik</CardTitle>
                    </CardHeader>
                    <CardContent className="text-blue-800 text-sm">
                        <p className="mb-2"><strong>Qualitätskriterien (0-20 Punkte):</strong></p>
                        <ul className="grid md:grid-cols-2 gap-1">
                            <li>✓ Vollständige Beschreibung (+3)</li>
                            <li>✓ Detailbeschreibung (+2)</li>
                            <li>✓ Voraussetzungen (+2)</li>
                            <li>✓ Maximale Höhe (+1)</li>
                            <li>✓ Bearbeitungszeit (+1)</li>
                            <li>✓ Antrag-URL (+1)</li>
                            <li>✓ Automatisierbar (+2)</li>
                            <li>✓ Hohe Priorität (+2)</li>
                            <li>✓ Bundesweit (+1)</li>
                            <li>✓ Einkommensgrenzen (+3)</li>
                            <li>✓ Wohnkriterien (+1)</li>
                            <li>✓ Korrekter Typ (+1)</li>
                        </ul>
                    </CardContent>
                </Card>
                
            </div>
        </div>
    );
}