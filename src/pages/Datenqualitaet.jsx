
import { useState } from 'react';
import { Foerderleistung } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertTriangle, ShieldCheck, DatabaseZap, Clock, Trash2 } from 'lucide-react';

const canonicalLeistungen = [
    {
        "titel": "Wohngeld", "typ": "wohngeld", "kurzbeschreibung": "Staatlicher Zuschuss zu den Wohnkosten für Haushalte mit geringem Einkommen",
        "vollbeschreibung": "Das Wohngeld ist ein Zuschuss zur Miete (Mietzuschuss) oder zu den Kosten selbst genutzten Wohneigentums (Lastenzuschuss). Es wird nur gezahlt, wenn keine anderen Sozialleistungen bezogen werden.",
        "kategorie": "Wohnen & Miete", "zielgruppen": ["Geringverdiener", "Rentner", "Studenten ohne BAföG"],
        "voraussetzungen_text": ["Eigenes Einkommen vorhanden (kein Bezug von Bürgergeld/Grundsicherung)", "Einkommen unterhalb der Wohngeld-Einkommensgrenzen", "Hauptwohnsitz in Deutschland"],
        "pruefkriterien": { "einkommensgrenzen": { "einzelperson_max": 1400, "paar_max": 1800, "pro_weiteres_kind": 300, "vermoegensgrenze": 60000 }, "wohnkriterien": { "nur_mieter": false, "max_miete": 2000 }, "sonstige_bedingungen": { "ausschlusskriterien": ["Bürgergeld", "Grundsicherung", "BAföG mit Vollförderung"] } },
        "leistungshoehe": { "typ": "berechnet", "betrag_fest": 330, "min_betrag": 10, "max_betrag": 650, "berechnungsformel": "Abhängig von Einkommen, Miete und Haushaltsgröße" },
        "antragsstelle": "Wohngeldstelle der Gemeinde- oder Stadtverwaltung", 
        "antrag_url": "https://www.bmwsb.bund.de/Webs/BMWSB/DE/themen/stadt-wohnen/wohnraumfoerderung/wohngeld/wohngeld-node.html", 
        "info_url": "https://www.bmwsb.bund.de/Webs/BMWSB/DE/themen/stadt-wohnen/wohnraumfoerderung/wohngeld/wohngeld-node.html",
        "bearbeitungszeit": "4-6 Wochen", "automatisierbar": true, "bundesweit": true, "status": "aktiv", "rechtsgrundlage": "Wohngeldgesetz (WoGG)", "prioritaet": 9
    },
    {
        "titel": "Kinderzuschlag", "typ": "kinderzuschlag", "kurzbeschreibung": "Zusätzliche Unterstützung für Familien mit geringem Einkommen - 297€ pro Kind monatlich",
        "vollbeschreibung": "Der Kinderzuschlag unterstützt Familien, die mit ihrem Einkommen zwar den eigenen Bedarf decken können, aber nicht den ihrer Kinder. Er wird zusätzlich zum Kindergeld gezahlt.",
        "kategorie": "Familie & Kinder", "zielgruppen": ["Familien mit niedrigem Einkommen", "Alleinerziehende", "Geringverdiener mit Kindern"],
        "voraussetzungen_text": ["Kindergeldanspruch für das Kind", "Mindesteinkommen der Eltern erreicht", "Einkommen unterhalb der Höchsteinkommensgrenze", "Kind unter 25 Jahren und unverheiratet"],
        "pruefkriterien": { "einkommensgrenzen": { "einzelperson_max": 2000, "paar_max": 3000, "pro_weiteres_kind": 400 }, "familienkriterien": { "min_kinder": 1, "max_kindalter": 24 }, "sonstige_bedingungen": { "min_einkommen_einzelperson": 600, "min_einkommen_paar": 900 } },
        "leistunghoehe": { "typ": "berechnet", "betrag_pro_kind": 297, "max_betrag": 1485, "berechnungsformel": "297 Euro pro Kind (Stand 2025)" },
        "antragsstelle": "Familienkasse der Bundesagentur für Arbeit", 
        "antrag_url": "https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag-verstehen/kinderzuschlag-antrag-stellen", 
        "info_url": "https://www.arbeitsagentur.de/familie-und-kinder/kinderzuschlag",
        "bearbeitungszeit": "4-6 Wochen", "automatisierbar": true, "bundesweit": true, "status": "aktiv", "rechtsgrundlage": "§ 6a Bundeskindergeldgesetz (BKGG)", "prioritaet": 8
    },
    {
        "titel": "Bürgergeld (Grundsicherung für Arbeitsuchende)", "typ": "buergergeld", "kurzbeschreibung": "Existenzsichernde Leistung für erwerbsfähige Hilfebedürftige und ihre Familien",
        "vollbeschreibung": "Das Bürgergeld sichert den Lebensunterhalt von erwerbsfähigen Menschen, die ihren Bedarf nicht aus eigenem Einkommen oder Vermögen decken können.",
        "kategorie": "Steuern & Finanzen", "zielgruppen": ["Arbeitslose", "Geringverdiener", "Aufstocker", "Familien in Not"],
        "voraussetzungen_text": ["Erwerbsfähig (15-67 Jahre)", "Hilfebedürftig (Einkommen/Vermögen nicht ausreichend)", "Gewöhnlicher Aufenthalt in Deutschland", "Antragstellung bei Jobcenter"],
        "pruefkriterien": { "einkommensgrenzen": { "einzelperson_max": 563, "paar_max": 1012, "pro_weiteres_kind": 300 }, "sonstige_bedingungen": { "max_alter": 67, "min_alter": 15, "vermoegensgrenze_einzelperson": 15000, "vermoegensgrenze_paar": 30000 } },
        "leistungshoehe": { "typ": "berechnet", "betrag_fest": 563, "berechnungsformel": "Regelbedarf plus Kosten der Unterkunft minus anrechenbares Einkommen" },
        "antragsstelle": "Jobcenter", 
        "antrag_url": "https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/arbeitslosengeld-2/antrag-stellen", 
        "info_url": "https://www.arbeitsagentur.de/arbeitslos-arbeit-finden/arbeitslosengeld-2",
        "bearbeitungszeit": "2-4 Wochen", "automatisierbar": true, "bundesweit": true, "status": "aktiv", "rechtsgrundlage": "SGB II", "prioritaet": 10
    },
    {
        "titel": "BAföG (Bundesausbildungsförderung)", "typ": "bafoeg", "kurzbeschreibung": "Finanzielle Unterstützung für Schüler und Studierende während der Ausbildung",
        "vollbeschreibung": "BAföG unterstützt junge Menschen beim Besuch weiterführender Schulen und Hochschulen, wenn die finanziellen Möglichkeiten der Familie nicht ausreichen.",
        "kategorie": "Bildung & Arbeit", "zielgruppen": ["Studierende", "Schüler", "Auszubildende"],
        "voraussetzungen_text": ["Deutsche Staatsangehörigkeit oder gleichgestellter Status", "Besuch einer förderungsfähigen Ausbildungsstätte", "Unter 45 Jahre bei Studienbeginn (mit Ausnahmen)", "Einkommen der Eltern/Ehepartner unterhalb der Freibeträge"],
        "pruefkriterien": { "einkommensgrenzen": { "eltern_freibetrag": 2415, "ehepartner_freibetrag": 1605 }, "sonstige_bedingungen": { "max_alter_studienbeginn": 45, "nur_student": true } },
        "leistungshoehe": { "typ": "berechnet", "max_betrag": 934, "berechnungsformel": "Bedarfssatz minus anrechenbares Einkommen" },
        "antragsstelle": "Studentenwerk/BAföG-Amt", 
        "antrag_url": "https://www.bafög.de/bafoeg/de/antrag-stellen/antrag-stellen_node.html", 
        "info_url": "https://www.bafög.de/",
        "bearbeitungszeit": "4-8 Wochen", "automatisierbar": true, "bundesweit": true, "status": "aktiv", "rechtsgrundlage": "Bundesausbildungsförderungsgesetz (BAföG)", "prioritaet": 7
    },
    {
        "titel": "Grundsicherung im Alter und bei Erwerbsminderung", "typ": "grundsicherung-alter", "kurzbeschreibung": "Existenzsichernde Leistung für Rentner und dauerhaft voll erwerbsgeminderte Menschen",
        "vollbeschreibung": "Die Grundsicherung im Alter sichert den Lebensunterhalt von Rentnern, deren Einkommen nicht für den notwendigen Lebensunterhalt ausreicht.",
        "kategorie": "Rente & Alter", "zielgruppen": ["Rentner", "Erwerbsgeminderte", "Menschen über 65"],
        "voraussetzungen_text": ["Alter ab 65 Jahren oder volle Erwerbsminderung", "Gewöhnlicher Aufenthalt in Deutschland", "Bedürftigkeit (Einkommen/Vermögen nicht ausreichend)"],
        "pruefkriterien": { "einkommensgrenzen": { "einzelperson_max": 1000, "paar_max": 1800 }, "sonstige_bedingungen": { "min_alter": 65, "oder_erwerbsgemindert": true } },
        "leistungshoehe": { "typ": "berechnet", "betrag_fest": 563, "berechnungsformel": "Regelbedarf plus Kosten der Unterkunft minus anrechenbares Einkommen" },
        "antragsstelle": "Sozialamt der Gemeinde oder des Kreises", 
        "antrag_url": "https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Grundsicherung/grundsicherung_node.html", 
        "info_url": "https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Grundsicherung/grundsicherung_node.html",
        "bearbeitungszeit": "4-6 Wochen", "automatisierbar": true, "bundesweit": true, "status": "aktiv", "rechtsgrundlage": "SGB XII", "prioritaet": 6
    }
];

// Intelligente Batch-Verarbeitung mit Rate-Limiting-Schutz
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const deleteWithRetry = async (id, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await Foerderleistung.delete(id);
            return { success: true };
        } catch (error) {
            if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
                // Exponential Backoff: Wait longer for each retry
                const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
                console.log(`Rate limit hit, waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
                await sleep(waitTime);
                continue;
            }
            throw error;
        }
    }
    throw new Error(`Failed to delete after ${maxRetries} attempts`);
};

export default function Datenqualitaet() {
    const [isLoading, setIsLoading] = useState(false);
    const [cleanupResult, setCleanupResult] = useState(null);
    const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });

    const handleCleanup = async () => {
        setIsLoading(true);
        setCleanupResult(null);
        setProgress({ current: 0, total: 0, phase: 'Initialisierung...' });
        
        try {
            // Phase 1: Alle existierenden Förderleistungen abrufen
            setProgress({ current: 0, total: 1, phase: 'Lade existierende Daten...' });
            const allLeistungen = await Foerderleistung.list();
            
            if (allLeistungen.length === 0) {
                setCleanupResult({
                    success: true,
                    deleted: 0,
                    created: canonicalLeistungen.length,
                    message: "Keine alten Daten gefunden. Erstelle sauberen Datensatz..."
                });
                
                // Direkt neue Daten einfügen
                const createdLeistungen = await Foerderleistung.bulkCreate(canonicalLeistungen);
                
                setCleanupResult({
                    success: true,
                    deleted: 0,
                    created: createdLeistungen.length,
                    message: "Sauberer Datensatz erfolgreich erstellt!"
                });
                setIsLoading(false);
                return;
            }
            
            // Phase 2: Intelligente Batch-Löschung mit Rate-Limiting-Schutz
            setProgress({ current: 0, total: allLeistungen.length, phase: 'Bereinige Duplikate...' });
            
            const BATCH_SIZE = 3; // Kleine Batches zur Vermeidung von Rate Limits
            const BATCH_DELAY = 1500; // 1.5 Sekunden zwischen Batches
            
            let deletedCount = 0;
            let failedDeletes = [];
            
            for (let i = 0; i < allLeistungen.length; i += BATCH_SIZE) {
                const batch = allLeistungen.slice(i, i + BATCH_SIZE);
                
                // Verarbeite jeden Batch sequenziell
                for (const leistung of batch) {
                    try {
                        await deleteWithRetry(leistung.id);
                        deletedCount++;
                        setProgress({ 
                            current: deletedCount, 
                            total: allLeistungen.length, 
                            phase: `Lösche Duplikate... (${deletedCount}/${allLeistungen.length})` 
                        });
                    } catch (error) {
                        console.error(`Failed to delete ${leistung.id}:`, error);
                        failedDeletes.push({ id: leistung.id, titel: leistung.titel });
                    }
                    
                    // Kurze Pause zwischen einzelnen Löschungen
                    await sleep(300);
                }
                
                // Längere Pause zwischen Batches
                if (i + BATCH_SIZE < allLeistungen.length) {
                    setProgress({ 
                        current: deletedCount, 
                        total: allLeistungen.length, 
                        phase: `Warte auf API-Limit... (${deletedCount}/${allLeistungen.length})` 
                    });
                    await sleep(BATCH_DELAY);
                }
            }
            
            // Phase 3: Sauberen Datensatz einfügen
            setProgress({ current: 0, total: canonicalLeistungen.length, phase: 'Erstelle sauberen Datensatz...' });
            
            // Kleine Pause vor dem Erstellen
            await sleep(2000);
            
            const createdLeistungen = await Foerderleistung.bulkCreate(canonicalLeistungen);
            
            setCleanupResult({
                success: true,
                deleted: deletedCount,
                created: createdLeistungen.length,
                failed: failedDeletes.length,
                failedItems: failedDeletes,
                message: failedDeletes.length > 0 
                    ? `Bereinigung größtenteils erfolgreich. ${failedDeletes.length} Einträge konnten nicht gelöscht werden.`
                    : "Datenbereinigung vollständig erfolgreich!"
            });
            
        } catch (error) {
            console.error("Fehler beim Daten-Cleanup:", error);
            setCleanupResult({ 
                success: false, 
                error: error.message,
                message: "Fehler bei der Datenbereinigung. Bitte versuchen Sie es später erneut."
            });
        }
        
        setIsLoading(false);
        setProgress({ current: 0, total: 0, phase: '' });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header Card */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <DatabaseZap className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                Datenbank-Qualitätsgate
                            </CardTitle>
                            <CardDescription className="text-lg mt-2">
                                Automatisierte Bereinigung von Duplikaten in der Förderleistungs-Datenbank
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Main Cleanup Card */}
            <Card className="border-none shadow-xl">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                        Intelligente Duplikate-Bereinigung
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-slate-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-slate-800 mb-2">Was passiert bei der Bereinigung:</h4>
                        <ul className="text-sm text-slate-700 space-y-1">
                            <li>• Alle existierenden Förderleistungen werden geladen</li>
                            <li>• Duplikate werden intelligent in kleinen Batches gelöscht</li>
                            <li>• Rate-Limiting-Schutz mit automatischen Wiederholungen</li>
                            <li>• Sauberer, kuratierter Datensatz wird eingefügt</li>
                        </ul>
                    </div>

                    {/* Warning */}
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-amber-800">Achtung: Destruktive Aktion</p>
                                <p className="text-sm text-amber-700 mt-1">
                                    Alle manuell hinzugefügten oder geänderten Förderleistungen werden entfernt und durch den kanonischen Datensatz ersetzt.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Display */}
                    {isLoading && (
                        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-blue-800">{progress.phase}</h4>
                                    {progress.total > 0 && (
                                        <p className="text-sm text-blue-600">
                                            {progress.current} von {progress.total} verarbeitet
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            {progress.total > 0 && (
                                <div className="space-y-2">
                                    <Progress 
                                        value={(progress.current / progress.total) * 100} 
                                        className="h-2"
                                    />
                                    <div className="flex items-center justify-between text-xs text-blue-600">
                                        <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                                        <span>{progress.current}/{progress.total}</span>
                                    </div>
                                </div>
                            )}
                            
                            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                <p className="text-xs text-blue-700 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Intelligente Rate-Limiting-Vermeidung aktiv. Dies kann einige Minuten dauern.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <Button 
                        onClick={handleCleanup} 
                        disabled={isLoading} 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                {progress.phase || 'Bereinigung läuft...'}
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-3 h-5 w-5" />
                                Duplikate jetzt bereinigen & Datenqualität sicherstellen
                            </>
                        )}
                    </Button>

                    {/* Results Display */}
                    {cleanupResult && (
                        <div className="mt-6">
                            {cleanupResult.success ? (
                                <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-green-800 text-lg">
                                                {cleanupResult.message}
                                            </h4>
                                            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                                    <p className="font-semibold text-red-600">{cleanupResult.deleted}</p>
                                                    <p className="text-slate-600">Duplikate gelöscht</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                                    <p className="font-semibold text-green-600">{cleanupResult.created}</p>
                                                    <p className="text-slate-600">Saubere Einträge</p>
                                                </div>
                                                {cleanupResult.failed > 0 && (
                                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                                        <p className="font-semibold text-amber-600">{cleanupResult.failed}</p>
                                                        <p className="text-slate-600">Fehlgeschlagen</p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {cleanupResult.failedItems && cleanupResult.failedItems.length > 0 && (
                                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <p className="text-sm font-semibold text-amber-800 mb-2">
                                                        Nicht gelöschte Einträge:
                                                    </p>
                                                    <ul className="text-xs text-amber-700 space-y-1">
                                                        {cleanupResult.failedItems.slice(0, 5).map((item, index) => (
                                                            <li key={index}>• {item.titel || item.id}</li>
                                                        ))}
                                                        {cleanupResult.failedItems.length > 5 && (
                                                            <li>• ... und {cleanupResult.failedItems.length - 5} weitere</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-red-800 text-lg">
                                                {cleanupResult.message}
                                            </h4>
                                            <p className="text-sm text-red-700 mt-2">
                                                Technischer Fehler: {cleanupResult.error}
                                            </p>
                                            <p className="text-xs text-red-600 mt-3">
                                                Versuchen Sie es in einigen Minuten erneut, wenn die API-Limits zurückgesetzt wurden.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-blue-50/30">
                <CardContent className="p-6">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <DatabaseZap className="w-5 h-5 text-blue-600" />
                        Technische Details
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-700">
                        <div>
                            <h5 className="font-medium mb-2">Rate-Limiting-Schutz:</h5>
                            <ul className="space-y-1 text-xs">
                                <li>• Batch-Größe: 3 Einträge</li>
                                <li>• Pause zwischen Batches: 1.5s</li>
                                <li>• Exponential Backoff bei Fehlern</li>
                                <li>• Automatische Wiederholungen</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-medium mb-2">Qualitätssicherung:</h5>
                            <ul className="space-y-1 text-xs">
                                <li>• {canonicalLeistungen.length} kuratierte Förderleistungen</li>
                                <li>• Vollständige Metadaten</li>
                                <li>• Offizielle Antragslinks</li>
                                <li>• Strukturierte Prüfkriterien</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
