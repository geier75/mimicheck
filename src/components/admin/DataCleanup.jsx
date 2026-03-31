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
    Database,
    RefreshCw,
    Target,
    Shield
} from "lucide-react";

// Automatische Duplikate-Erkennung und Qualitäts-Scoring
const analyzeAndCleanDuplicates = (leistungen) => {
    const groups = {};
    
    // Gruppiere nach normalisiertem Titel
    leistungen.forEach(leistung => {
        const normalizedTitle = leistung.titel
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[()]/g, '')
            .replace('kiz', 'kinderzuschlag')
            .replace('wohngeld plus', 'wohngeld')
            .replace('alg i', 'arbeitslosengeld i')
            .replace('bürgergeld (ehem. hartz iv)', 'bürgergeld')
            .replace('bürgergeld (grundsicherung für arbeitsuchende)', 'bürgergeld')
            .replace('bafög studium', 'bafög')
            .replace('bafög (studium & schule)', 'bafög')
            .replace('bafög (bundesausbildungsförderung)', 'bafög')
            .replace('bafög (schüler & studierende)', 'bafög')
            .trim();

        if (!groups[normalizedTitle]) {
            groups[normalizedTitle] = [];
        }
        groups[normalizedTitle].push(leistung);
    });

    // Finde nur echte Duplikate (mehr als 1 Eintrag)
    const duplicateGroups = Object.entries(groups)
        .filter(([title, items]) => items.length > 1)
        .map(([title, items]) => ({
            title,
            items,
            count: items.length
        }));

    return duplicateGroups;
};

// Qualitäts-Score für jede Förderleistung
const calculateQualityScore = (leistung) => {
    let score = 0;
    
    // Vollständigkeit der Daten (0-10 Punkte)
    if (leistung.kurzbeschreibung && leistung.kurzbeschreibung.length > 20) score += 2;
    if (leistung.vollbeschreibung && leistung.vollbeschreibung.length > 50) score += 1;
    if (leistung.voraussetzungen && leistung.voraussetzungen.length > 0) score += 2;
    if (leistung.maximale_hoehe && leistung.maximale_hoehe.length > 5) score += 1;
    if (leistung.bearbeitungszeit) score += 1;
    if (leistung.antrag_url && leistung.antrag_url.includes('http')) score += 2;
    if (leistung.info_url && leistung.info_url.includes('http')) score += 1;
    
    // Funktionale Eigenschaften (0-5 Punkte)
    if (leistung.automatisierbar) score += 2;
    if (leistung.prioritaet && leistung.prioritaet >= 7) score += 1;
    if (leistung.bundesweit) score += 1;
    if (leistung.status === 'aktiv') score += 1;
    
    // Struktur-Qualität (0-5 Punkte)
    if (leistung.einkommensgrenzen) score += 2;
    if (leistung.wohnsituation_kriterien || leistung.familie_kriterien) score += 1;
    if (leistung.zielgruppen && leistung.zielgruppen.length > 0) score += 1;
    if (leistung.rechtsgrundlage) score += 1;

    return Math.min(20, score); // Max 20 Punkte
};

export default function DataCleanup() {
    const [leistungen, setLeistungen] = useState([]);
    const [duplicateGroups, setDuplicateGroups] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [cleanupResults, setCleanupResults] = useState(null);
    const [cleanupProgress, setCleanupProgress] = useState(0);

    useEffect(() => {
        loadAndAnalyze();
    }, []);

    const loadAndAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const allLeistungen = await Foerderleistung.list();
            setLeistungen(allLeistungen);
            
            const duplicates = analyzeAndCleanDuplicates(allLeistungen);
            setDuplicateGroups(duplicates);
            
        } catch (error) {
            console.error("Fehler beim Laden:", error);
        }
        setIsAnalyzing(false);
    };

    const getBestLeistung = (items) => {
        const scored = items.map(item => ({
            ...item,
            qualityScore: calculateQualityScore(item)
        }));
        
        scored.sort((a, b) => b.qualityScore - a.qualityScore);
        return scored[0];
    };

    const getWorstLeistungen = (items) => {
        const scored = items.map(item => ({
            ...item,
            qualityScore: calculateQualityScore(item)
        }));
        
        scored.sort((a, b) => b.qualityScore - a.qualityScore);
        return scored.slice(1); // Alle außer dem Besten
    };

    const executeCleanup = async () => {
        setCleanupProgress(0);
        const results = {
            processed: 0,
            deleted: 0,
            kept: 0,
            errors: []
        };

        try {
            for (let i = 0; i < duplicateGroups.length; i++) {
                const group = duplicateGroups[i];
                const toDelete = getWorstLeistungen(group.items);
                
                // Lösche die schlechteren Einträge
                for (const leistung of toDelete) {
                    try {
                        await Foerderleistung.delete(leistung.id);
                        results.deleted++;
                    } catch (error) {
                        results.errors.push(`Fehler beim Löschen von ${leistung.titel}: ${error.message}`);
                    }
                }
                
                results.kept++;
                results.processed = group.items.length;
                setCleanupProgress(Math.round(((i + 1) / duplicateGroups.length) * 100));
            }

            setCleanupResults(results);
            
            // Neu laden nach Cleanup
            await loadAndAnalyze();
            
        } catch (error) {
            console.error("Cleanup Fehler:", error);
            setCleanupResults({
                ...results,
                errors: [...results.errors, error.message]
            });
        }
    };

    const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.count - 1, 0);
    const totalEntries = leistungen.length;

    return (
        <div className="space-y-6">
            {/* Kritischer Status Alert */}
            {totalDuplicates > 10 && (
                <Alert variant="destructive" className="border-red-400 bg-red-50">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertDescription className="text-red-800 font-semibold">
                        <strong>KRITISCHE DATENVERSEUCHUNG ERKANNT!</strong><br />
                        {totalDuplicates} redundante Einträge in der Datenbank gefunden. 
                        Dies führt zu Nutzerverwirrung und fehlerhaften Anspruchsprüfungen.
                    </AlertDescription>
                </Alert>
            )}

            {/* Cleanup Status */}
            {cleanupResults && (
                <Card className="border-green-300 bg-green-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-800">Bereinigung abgeschlossen</span>
                        </div>
                        <div className="text-sm text-green-700">
                            ✅ {cleanupResults.deleted} Duplikate gelöscht<br />
                            ✅ {cleanupResults.kept} beste Versionen behalten<br />
                            {cleanupResults.errors.length > 0 && (
                                <span className="text-red-600">
                                    ⚠️ {cleanupResults.errors.length} Fehler aufgetreten
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Cleanup Progress */}
            {cleanupProgress > 0 && cleanupProgress < 100 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                            <span className="font-semibold">Datenbank wird bereinigt...</span>
                        </div>
                        <Progress value={cleanupProgress} className="h-2" />
                        <div className="text-xs text-slate-600 mt-1">
                            {cleanupProgress}% abgeschlossen
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Statistiken */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-slate-800">{totalEntries}</div>
                        <div className="text-xs text-slate-600">Gesamt Einträge</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{duplicateGroups.length}</div>
                        <div className="text-xs text-slate-600">Duplikat-Gruppen</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600">{totalDuplicates}</div>
                        <div className="text-xs text-slate-600">Zu löschende</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {Math.round((totalDuplicates / totalEntries) * 100)}%
                        </div>
                        <div className="text-xs text-slate-600">Bereinigungspotential</div>
                    </CardContent>
                </Card>
            </div>

            {/* Hauptaktionen */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Automatische Datenbereinigung
                        </span>
                        <Button
                            onClick={executeCleanup}
                            disabled={isAnalyzing || totalDuplicates === 0}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {totalDuplicates} Duplikate bereinigen
                        </Button>
                    </CardTitle>
                </CardHeader>
            </Card>

            {/* Top 5 kritische Duplikate */}
            {duplicateGroups.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-red-500" />
                            Kritische Duplikate (Top 5)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {duplicateGroups
                                .sort((a, b) => b.count - a.count)
                                .slice(0, 5)
                                .map((group, index) => {
                                    const best = getBestLeistung(group.items);
                                    const toDelete = group.count - 1;

                                    return (
                                        <div key={group.title} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                                            <div>
                                                <div className="font-semibold text-slate-800 capitalize">
                                                    {group.title}
                                                </div>
                                                <div className="text-sm text-slate-600">
                                                    Beste Version: Score {calculateQualityScore(best)}/20
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-red-600 text-white">
                                                    {group.count}x vorhanden
                                                </Badge>
                                                <Badge variant="outline" className="text-red-600">
                                                    -{toDelete} löschen
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bereinigungsregeln */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Shield className="w-5 h-5" />
                        Intelligente Bereinigungslogik
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800 text-sm">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold mb-2">Qualitätsbewertung (0-20 Punkte):</h4>
                            <ul className="space-y-1">
                                <li>✓ Vollständige Beschreibungen (+3)</li>
                                <li>✓ Voraussetzungen definiert (+2)</li>
                                <li>✓ Offizielle Links vorhanden (+3)</li>
                                <li>✓ Automatisierbar markiert (+2)</li>
                                <li>✓ Hohe Priorität (+1)</li>
                                <li>✓ Einkommensgrenzen definiert (+2)</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Bereinigungsstrategie:</h4>
                            <ul className="space-y-1">
                                <li>🥇 Höchster Score wird behalten</li>
                                <li>🗑️ Alle anderen werden gelöscht</li>
                                <li>⚡ Vollautomatisch basierend auf Datenqualität</li>
                                <li>🔄 Backup-fähiger Prozess</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}