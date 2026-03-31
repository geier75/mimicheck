import { useState, useEffect } from 'react';
import { Foerderleistung } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
    Shield, 
    CheckCircle, 
    AlertTriangle,
    ExternalLink,
    FileText,
    Target,
    Database
} from "lucide-react";

// Offizielle Förderleistungen - EINMALIG und EINDEUTIG
const OFFIZIELLE_LEISTUNGEN = {
    wohngeld: {
        titel: "Wohngeld",
        typ: "wohngeld",
        slug: "wohngeld",
        kategorie: "Wohnen & Miete",
        kurzbeschreibung: "Staatlicher Zuschuss zur Miete oder zu den Wohnkosten für einkommensschwache Haushalte.",
        maximale_hoehe: "Bis zu 650€ monatlich (abhängig von Einkommen, Miete und Haushaltsgröße)",
        bearbeitungszeit: "2-3 Monate",
        antrag_url: "https://www.bundesregierung.de/breg-de/service/buergerinnen-und-buerger/wohngeld-372280",
        info_url: "https://www.bmwsb.bund.de/Webs/BMWSB/DE/themen/stadt-wohnen/wohnraumfoerderung/wohngeld/wohngeld-node.html",
        automatisierbar: true,
        bundesweit: true,
        prioritaet: 8,
        hinweise: "Seit 2023 automatisch mit erhöhten Sätzen (ehem. 'Wohngeld Plus'). Antrag bei örtlicher Wohngeldbehörde.",
        synonyme: ["wohngeld plus", "wohngeld reform", "mietzuschuss", "lastenzuschuss"]
    },
    
    kinderzuschlag: {
        titel: "Kinderzuschlag (KiZ)",
        typ: "kinderzuschlag",
        slug: "kinderzuschlag",
        kategorie: "Familie & Kinder",
        kurzbeschreibung: "Zusatzleistung zum Kindergeld für Eltern, deren Einkommen für sich selbst, aber nicht für die Kinder reicht.",
        maximale_hoehe: "Bis zu 292€ pro Kind monatlich",
        bearbeitungszeit: "4-6 Wochen",
        antrag_url: "https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag-verstehen/kinderzuschlag-antrag-stellen",
        info_url: "https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag",
        automatisierbar: true,
        bundesweit: true,
        prioritaet: 8,
        hinweise: "Einheitlicher Antrag bei der Familienkasse. Online-Antrag über BundID möglich.",
        synonyme: ["kiz", "kinderzuschlag kiz", "zuschlag kindergeld"]
    },
    
    buergergeld: {
        titel: "Bürgergeld",
        typ: "buergergeld",
        slug: "buergergeld",
        kategorie: "Steuern & Finanzen",
        kurzbeschreibung: "Grundsicherung für erwerbsfähige Hilfebedürftige (Nachfolger von Hartz IV).",
        maximale_hoehe: "563€ Regelbedarf + Kosten für Unterkunft und Heizung",
        bearbeitungszeit: "4-8 Wochen",
        antrag_url: "https://www.arbeitsagentur.de/arbeitslosengeld-2/antrag-stellen",
        info_url: "https://www.arbeitsagentur.de/arbeitslosengeld-2",
        automatisierbar: true,
        bundesweit: true,
        prioritaet: 9,
        hinweise: "Seit 2023 Nachfolger von ALG II/Hartz IV. Antrag beim örtlichen Jobcenter.",
        synonyme: ["hartz iv", "alg ii", "arbeitslosengeld ii", "grundsicherung arbeitsuchende"]
    },

    kindergeld: {
        titel: "Kindergeld",
        typ: "kindergeld",
        slug: "kindergeld",
        kategorie: "Familie & Kinder",
        kurzbeschreibung: "Monatliche finanzielle Unterstützung für alle Familien mit Kindern zur Deckung des Grundbedarfs.",
        maximale_hoehe: "250€ pro Kind monatlich",
        bearbeitungszeit: "4-6 Wochen",
        antrag_url: "https://www.arbeitsagentur.de/familie-und-kinder/kindergeld-antrag-stellen",
        info_url: "https://www.arbeitsagentur.de/familie-und-kinder/kindergeld",
        automatisierbar: false,
        bundesweit: true,
        prioritaet: 9,
        hinweise: "Universelle Familienleistung. Antrag bei der Familienkasse der Bundesagentur für Arbeit.",
        synonyme: ["kindergeld antrag"]
    },

    bafoeg: {
        titel: "BAföG",
        typ: "bafoeg",
        slug: "bafoeg",
        kategorie: "Bildung & Arbeit",
        kurzbeschreibung: "Bundesausbildungsförderung für Schüler und Studierende aus einkommensschwachen Familien.",
        maximale_hoehe: "Bis zu 934€ monatlich (je nach Bedarf)",
        bearbeitungszeit: "6-12 Wochen",
        antrag_url: "https://www.bafög.de/bafoeg/de/antrag-stellen/antrag-stellen_node.html",
        info_url: "https://www.bafög.de/",
        automatisierbar: true,
        bundesweit: true,
        prioritaet: 8,
        hinweise: "Separate Anträge für Schüler-BAföG und Studenten-BAföG. Antrag beim örtlichen BAföG-Amt.",
        synonyme: ["bafög studium", "bafög schule", "bundesausbildungsförderung", "ausbildungsförderung"]
    }
};

export default function StrategicDataCleanup() {
    const [currentLeistungen, setCurrentLeistungen] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [cleanupPlan, setCleanupPlan] = useState([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);

    useEffect(() => {
        analyzeCurrentData();
    }, []);

    const analyzeCurrentData = async () => {
        setIsAnalyzing(true);
        try {
            const allLeistungen = await Foerderleistung.list();
            setCurrentLeistungen(allLeistungen);
            
            const plan = createCleanupPlan(allLeistungen);
            setCleanupPlan(plan);
            
        } catch (error) {
            console.error("Analyse-Fehler:", error);
        }
        setIsAnalyzing(false);
    };

    const createCleanupPlan = (leistungen) => {
        const plan = [];
        
        Object.entries(OFFIZIELLE_LEISTUNGEN).forEach(([slug, officialEntry]) => {
            // Finde alle Varianten dieser Leistung
            const variants = leistungen.filter(l => {
                const normalizedTitle = l.titel.toLowerCase().trim();
                
                // Exakter Match
                if (normalizedTitle === officialEntry.titel.toLowerCase()) return true;
                
                // Synonym-Match
                return officialEntry.synonyme.some(synonym => 
                    normalizedTitle.includes(synonym) || 
                    synonym.includes(normalizedTitle.replace(/[()]/g, '').trim())
                );
            });

            if (variants.length > 0) {
                plan.push({
                    officialSlug: slug,
                    officialData: officialEntry,
                    currentVariants: variants,
                    action: variants.length > 1 ? 'CONSOLIDATE' : 'UPDATE'
                });
            }
        });

        // Finde verwaiste Einträge (nicht in offizieller Liste)
        const knownIds = new Set();
        plan.forEach(p => p.currentVariants.forEach(v => knownIds.add(v.id)));
        
        const orphans = leistungen.filter(l => !knownIds.has(l.id));
        if (orphans.length > 0) {
            plan.push({
                officialSlug: 'orphans',
                officialData: { titel: 'Verwaiste Einträge' },
                currentVariants: orphans,
                action: 'REVIEW'
            });
        }

        return plan;
    };

    const executeStrategicCleanup = async () => {
        setIsExecuting(true);
        setProgress(0);
        
        const results = {
            consolidated: 0,
            updated: 0,
            deleted: 0,
            created: 0,
            errors: []
        };

        try {
            for (let i = 0; i < cleanupPlan.length; i++) {
                const planItem = cleanupPlan[i];
                
                if (planItem.action === 'CONSOLIDATE') {
                    // Mehrere Varianten zu einer konsolidieren
                    const bestVariant = planItem.currentVariants.reduce((best, current) => 
                        calculateQualityScore(current) > calculateQualityScore(best) ? current : best
                    );

                    // Update der besten Variante mit offiziellen Daten
                    try {
                        await Foerderleistung.update(bestVariant.id, {
                            ...planItem.officialData,
                            // Behalte ID und Timestamps
                            id: bestVariant.id,
                            created_date: bestVariant.created_date,
                            updated_date: new Date().toISOString()
                        });
                        results.updated++;
                    } catch (error) {
                        results.errors.push(`Update Fehler bei ${planItem.officialData.titel}: ${error.message}`);
                    }

                    // Lösche alle anderen Varianten
                    for (const variant of planItem.currentVariants) {
                        if (variant.id !== bestVariant.id) {
                            try {
                                await Foerderleistung.delete(variant.id);
                                results.deleted++;
                            } catch (error) {
                                results.errors.push(`Lösch-Fehler bei ${variant.titel}: ${error.message}`);
                            }
                        }
                    }
                    results.consolidated++;
                    
                } else if (planItem.action === 'UPDATE') {
                    // Einzelnen Eintrag aktualisieren
                    const variant = planItem.currentVariants[0];
                    try {
                        await Foerderleistung.update(variant.id, {
                            ...planItem.officialData,
                            id: variant.id,
                            created_date: variant.created_date,
                            updated_date: new Date().toISOString()
                        });
                        results.updated++;
                    } catch (error) {
                        results.errors.push(`Update Fehler bei ${planItem.officialData.titel}: ${error.message}`);
                    }
                }
                
                setProgress(Math.round(((i + 1) / cleanupPlan.length) * 100));
            }
            
            setResults(results);
            
            // Daten neu laden
            await analyzeCurrentData();
            
        } catch (error) {
            console.error("Cleanup Fehler:", error);
            results.errors.push(`Allgemeiner Fehler: ${error.message}`);
        }
        
        setIsExecuting(false);
    };

    const calculateQualityScore = (leistung) => {
        let score = 0;
        if (leistung.kurzbeschreibung && leistung.kurzbeschreibung.length > 30) score += 3;
        if (leistung.antrag_url && leistung.antrag_url.includes('http')) score += 2;
        if (leistung.automatisierbar) score += 2;
        if (leistung.prioritaet >= 8) score += 2;
        if (leistung.maximale_hoehe && leistung.maximale_hoehe.includes('€')) score += 1;
        return score;
    };

    const getTotalDuplicates = () => {
        return cleanupPlan.reduce((sum, item) => {
            return sum + (item.action === 'CONSOLIDATE' ? item.currentVariants.length - 1 : 0);
        }, 0);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardContent className="p-8 text-center">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <Shield className="w-12 h-12 text-blue-600" />
                            <div>
                                <h1 className="text-4xl font-bold text-slate-800">
                                    Strategische Datenbereinigung
                                </h1>
                                <p className="text-lg text-slate-600 mt-2">
                                    Basierend auf offiziellen deutschen Rechtsgrundlagen
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mt-6">
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                                <div className="text-2xl font-bold text-blue-600">{cleanupPlan.length}</div>
                                <div className="text-sm text-slate-600">Leistungsgruppen</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-amber-200">
                                <div className="text-2xl font-bold text-amber-600">{getTotalDuplicates()}</div>
                                <div className="text-sm text-slate-600">Zu löschende Duplikate</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                                <div className="text-2xl font-bold text-green-600">{Object.keys(OFFIZIELLE_LEISTUNGEN).length}</div>
                                <div className="text-sm text-slate-600">Offizielle Standards</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cleanup Button */}
                {cleanupPlan.length > 0 && !results && (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Button
                                onClick={executeStrategicCleanup}
                                disabled={isExecuting}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                            >
                                <Database className="w-5 h-5 mr-2" />
                                {isExecuting ? 'Bereinigung läuft...' : 'Strategische Bereinigung starten'}
                            </Button>
                            
                            {isExecuting && (
                                <div className="mt-4 space-y-2">
                                    <Progress value={progress} className="h-3" />
                                    <p className="text-sm text-slate-600">{progress}% abgeschlossen</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Ergebnisse */}
                {results && (
                    <Card className="border-green-400 bg-green-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-800">
                                <CheckCircle className="w-6 h-6" />
                                Bereinigung erfolgreich abgeschlossen
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{results.consolidated}</div>
                                    <div className="text-sm">Konsolidiert</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{results.updated}</div>
                                    <div className="text-sm">Aktualisiert</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{results.deleted}</div>
                                    <div className="text-sm">Gelöscht</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{results.errors.length}</div>
                                    <div className="text-sm">Fehler</div>
                                </div>
                            </div>
                            
                            {results.errors.length > 0 && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Fehler während der Bereinigung:</strong>
                                        <ul className="list-disc list-inside mt-2">
                                            {results.errors.map((error, i) => (
                                                <li key={i} className="text-sm">{error}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Bereinigungsplan */}
                <div className="space-y-4">
                    {cleanupPlan.map((planItem, index) => (
                        <Card key={index} className={`
                            ${planItem.action === 'CONSOLIDATE' ? 'border-amber-400 bg-amber-50' :
                              planItem.action === 'UPDATE' ? 'border-blue-400 bg-blue-50' :
                              'border-gray-400 bg-gray-50'}
                        `}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{planItem.officialData.titel}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            {planItem.currentVariants.length} Variante(n)
                                        </Badge>
                                        <Badge className={`
                                            ${planItem.action === 'CONSOLIDATE' ? 'bg-amber-600' :
                                              planItem.action === 'UPDATE' ? 'bg-blue-600' :
                                              'bg-gray-600'} text-white
                                        `}>
                                            {planItem.action}
                                        </Badge>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {planItem.action !== 'REVIEW' && (
                                    <div className="mb-4 p-3 bg-white rounded-lg border">
                                        <h4 className="font-semibold text-green-800 mb-2">Offizielle Version:</h4>
                                        <p className="text-sm text-slate-700 mb-2">{planItem.officialData.kurzbeschreibung}</p>
                                        <div className="flex items-center gap-2">
                                            {planItem.officialData.antrag_url && (
                                                <a href={planItem.officialData.antrag_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                                                    <ExternalLink className="w-3 h-3" />
                                                    Offizieller Antrag
                                                </a>
                                            )}
                                            <Badge variant="outline">{planItem.officialData.maximale_hoehe}</Badge>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-slate-800">Aktuelle Varianten:</h4>
                                    {planItem.currentVariants.map((variant, i) => (
                                        <div key={variant.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                            <div>
                                                <span className="font-medium">{variant.titel}</span>
                                                <p className="text-xs text-slate-600 line-clamp-1">
                                                    {variant.kurzbeschreibung?.slice(0, 80)}...
                                                </p>
                                            </div>
                                            <Badge variant="outline">
                                                Score: {calculateQualityScore(variant)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Rechtliche Hinweise */}
                <Card className="border-slate-300 bg-slate-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            <FileText className="w-5 h-5" />
                            Rechtliche Grundlagen der Bereinigung
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-700">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2">Konsolidierungsprinzipien:</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>"Wohngeld Plus" ist seit 2023 automatischer Bestandteil des Wohngeldes</li>
                                    <li>Kinderzuschlag hat nur eine gültige Beantragungsgrundlage</li>
                                    <li>Bürgergeld ersetzt seit 2023 ALG II/Hartz IV</li>
                                    <li>BAföG-Varianten werden unter einem Eintrag zusammengefasst</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Qualitätskriterien:</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Aktuelle und korrekte Bezeichnung</li>
                                    <li>Link zu offiziellem Antragsformular</li>
                                    <li>Vollständige und präzise Beschreibung</li>
                                    <li>Korrekte Höchstbeträge und Bearbeitungszeiten</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}