
import { useState, useEffect } from "react";
import { Abrechnung } from "@/api/entities";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Loader2,
    AlertTriangle,
    ArrowLeft,
    Printer,
    Home
} from "lucide-react";
import BerichtHeader from "@/components/bericht/BerichtHeader";
import FehlerAuflistung from "@/components/bericht/FehlerAuflistung";
import KostenUebersicht from "@/components/bericht/KostenUebersicht";
import Musterbrief from "@/components/bericht/Musterbrief";
import PdfExportButton from "@/components/bericht/PdfExportButton";
import { User } from "@/api/entities";

export default function Bericht() {
    const [abrechnung, setAbrechnung] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDaten = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // FIXED: Better URL parameter validation
                const urlParams = new URLSearchParams(location.search);
                const abrechnungId = urlParams.get('id');

                console.log("Abrechnung ID from URL:", abrechnungId);

                // FIXED: Validate ID before making API call
                if (!abrechnungId || abrechnungId === 'null' || abrechnungId === 'undefined') {
                    setError("Keine gültige Abrechnungs-ID gefunden. Bitte wählen Sie eine Abrechnung aus der Übersicht aus.");
                    setIsLoading(false);
                    return;
                }

                // FIXED: Additional ID format validation
                if (abrechnungId.length < 10) {
                    setError("Ungültige Abrechnungs-ID Format. Bitte prüfen Sie den Link.");
                    setIsLoading(false);
                    return;
                }

                const [abrechnungData, currentUser] = await Promise.all([
                    Abrechnung.get(abrechnungId),
                    User.me().catch(() => null) // Don't fail if user not found
                ]);

                if (!abrechnungData) {
                    setError("Abrechnung nicht gefunden. Möglicherweise wurde sie gelöscht oder Sie haben keine Berechtigung.");
                } else {
                    console.log("Loaded Abrechnung:", abrechnungData);
                    setAbrechnung(abrechnungData);
                    setUser(currentUser);
                }

            } catch (e) {
                console.error("Fehler beim Laden des Berichts:", e);

                // FIXED: Better error messages based on error type
                if (e.message?.includes('404') || e.message?.includes('not found')) {
                    setError("Diese Abrechnung existiert nicht oder wurde gelöscht.");
                } else if (e.message?.includes('403') || e.message?.includes('unauthorized')) {
                    setError("Sie haben keine Berechtigung, diese Abrechnung anzuzeigen.");
                } else {
                    setError("Der Bericht konnte nicht geladen werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchDaten();
    }, [location]);

    const handlePrint = () => {
        window.print();
    };

    // FIXED: Better loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-800/80">
                        <CardContent className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-6" />
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                                Bericht wird geladen...
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Einen Moment bitte
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // FIXED: Enhanced error state with actionable options
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-900/20">
                        <CardContent className="text-center py-20">
                            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                                Bericht nicht gefunden
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
                                {error}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to={createPageUrl("Abrechnungen")}>
                                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Zu den Abrechnungen
                                    </Button>
                                </Link>
                                <Link to={createPageUrl("Upload")}>
                                    <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                        Neue Analyse starten
                                    </Button>
                                </Link>
                                <Link to={createPageUrl("Dashboard")}>
                                    <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <Home className="w-4 h-4 mr-2" />
                                        Dashboard
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // FIXED: Additional safety check before rendering
    if (!abrechnung) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-800/80">
                        <CardContent className="text-center py-20">
                            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
                            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                                Keine Daten verfügbar
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Die Abrechnung konnte nicht geladen werden.
                            </p>
                            <Link to={createPageUrl("Abrechnungen")}>
                                <Button>Zurück zur Übersicht</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8 min-h-screen">
            <div className="max-w-5xl mx-auto">
                {/* Action Bar */}
                <div className="flex flex-wrap gap-3 justify-between items-center mb-6 print:hidden">
                    <Link to={createPageUrl("Abrechnungen")}>
                        <Button variant="outline" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Zurück zur Übersicht
                        </Button>
                    </Link>

                    <div className="flex gap-2">
                        <PdfExportButton abrechnung={abrechnung} user={user} />

                        <Button onClick={handlePrint} variant="outline" className="bg-white dark:bg-slate-800">
                            <Printer className="w-4 h-4 mr-2" />
                            Drucken
                        </Button>
                    </div>
                </div>

                {/* Report Content - FIXED: Add safety checks for all sub-components */}
                <div className="p-8 sm:p-12 bg-white dark:bg-slate-800 rounded-lg shadow-2xl space-y-12 border border-slate-200 dark:border-slate-700">
                    <BerichtHeader abrechnung={abrechnung} />

                    <FehlerAuflistung
                        analyseErgebnis={abrechnung.analyse_ergebnis || {}}
                        rueckforderung={abrechnung.rueckforderung_potential || 0}
                    />

                    <KostenUebersicht
                        analyseErgebnis={abrechnung.analyse_ergebnis || {}}
                        gesamtkosten={abrechnung.gesamtkosten || 0}
                    />

                    <Musterbrief abrechnung={abrechnung} user={user} />
                </div>
            </div>
        </div>
    );
}
