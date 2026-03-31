import { useState, useEffect } from "react";
import { Abrechnung } from "@/api/entities";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    ArrowRight,
    AlertTriangle,
    CheckCircle,
    Loader2,
    Plus,
    Trash2,
    RefreshCcw,
    Search,
    Filter,
    Euro
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import SuccessToast from "@/components/ui/SuccessToast";
import { filterAndSortAbrechnungen } from "@/lib/abrechnungenUtils";
import SpotlightCard from "@/components/ui/SpotlightCard";
import DashboardAnimation from "@/components/animations/DashboardAnimation"; // Subtle background

export default function Abrechnungen() {
    const [abrechnungen, setAbrechnungen] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [abrechnungToDelete, setAbrechnungToDelete] = useState(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState('alle');
    const [minPotential, setMinPotential] = useState('');
    const [sortBy, setSortBy] = useState('created_date');
    const [sortOrder, setSortOrder] = useState('desc');

    const { t } = useTranslation();

    const loadAbrechnungen = async (showRefreshLoader = false) => {
        if (showRefreshLoader) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        setError(null);

        try {
            // Supabase format: Abrechnung.list({ orderBy, ascending })
            const data = await Abrechnung.list({
                orderBy: 'created_date',
                ascending: false
            });
            setAbrechnungen(data || []);
        } catch (error) {
            console.error("Fehler beim Laden der Abrechnungen:", error);
            setError("Die Abrechnungen konnten nicht geladen werden.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadAbrechnungen();
    }, []);

    const displayedAbrechnungen = filterAndSortAbrechnungen(abrechnungen, {
        status: statusFilter,
        minPotential: Number(minPotential) || 0,
        sortBy,
        order: sortOrder,
    });

    const openDeleteDialog = (abrechnung) => {
        setAbrechnungToDelete(abrechnung);
        setIsAlertOpen(true);
    };

    const handleDelete = async () => {
        if (!abrechnungToDelete) return;

        setIsDeleting(true);
        try {
            await Abrechnung.delete(abrechnungToDelete.id);
            await loadAbrechnungen();
            setSuccessMessage('Abrechnung erfolgreich gelöscht');
            setShowSuccessToast(true);
            setError(null);
        } catch (error) {
            console.error("Fehler beim Löschen der Abrechnung:", error);
            setError("Die Abrechnung konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.");
        } finally {
            setIsDeleting(false);
            setIsAlertOpen(false);
            setAbrechnungToDelete(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'abgeschlossen': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'in_bearbeitung': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'wartend': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'fehler': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'abgeschlossen': return 'Abgeschlossen';
            case 'in_bearbeitung': return 'In Bearbeitung';
            case 'wartend': return 'Wartend';
            case 'fehler': return 'Fehler';
            default: return status;
        }
    };

    const StatusBadge = ({ status }) => (
        <Badge className={`${getStatusColor(status)} border bg-transparent`}>
            {status === 'abgeschlossen' && <CheckCircle className="w-3 h-3 mr-1" />}
            {status === 'in_bearbeitung' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            {status === 'fehler' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {getStatusText(status)}
        </Badge>
    );

    const getAnalysisResult = (abrechnung) => {
        if (abrechnung.rueckforderung_potential > 0) {
            return (
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Euro className="w-5 h-5" />
                    <span className="text-xl font-bold">{(abrechnung.rueckforderung_potential || 0).toFixed(2)} €</span>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                        Rückforderung
                    </span>
                </div>
            );
        } else if (abrechnung.fehler_anzahl > 0) {
            return (
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{abrechnung.fehler_anzahl} Auffälligkeiten</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Alles in Ordnung</span>
            </div>
        );
    };

    if (isLoading) {
        return <LoadingState message="Abrechnungen werden geladen..." fullScreen />;
    }

    return (
        <div className="h-full w-full bg-transparent text-white relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0 opacity-30">
                <DashboardAnimation />
            </div>

            <SuccessToast
                message={successMessage}
                isVisible={showSuccessToast}
                onClose={() => setShowSuccessToast(false)}
            />

            <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h1 className="text-4xl font-bold tracking-tight font-heading mb-2">
                                Meine <span className="text-blue-400">Abrechnungen</span>
                            </h1>
                            <p className="text-slate-400 text-lg">
                                Verwalte und analysiere deine Dokumente an einem Ort.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-3"
                        >
                            <Button
                                variant="outline"
                                onClick={() => loadAbrechnungen(true)}
                                disabled={isRefreshing}
                                className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                            >
                                {isRefreshing ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                )}
                                Aktualisieren
                            </Button>
                            <Link to={createPageUrl("Upload")}>
                                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Neue Prüfung
                                </Button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Filter Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10"
                    >
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</label>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                >
                                    <option value="alle">Alle Status</option>
                                    <option value="abgeschlossen">Abgeschlossen</option>
                                    <option value="in_bearbeitung">In Bearbeitung</option>
                                    <option value="wartend">Wartend</option>
                                    <option value="fehler">Fehler</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Min. Rückforderung</label>
                            <div className="relative">
                                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0.00"
                                    value={minPotential}
                                    onChange={(e) => setMinPotential(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sortierung</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                            >
                                <option value="created_date">Datum</option>
                                <option value="rueckforderung_potential">Rückforderungshöhe</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Reihenfolge</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                            >
                                <option value="desc">Neueste zuerst</option>
                                <option value="asc">Älteste zuerst</option>
                            </select>
                        </div>
                    </motion.div>

                    {error && <ErrorState message={error} onRetry={() => loadAbrechnungen()} />}

                    {/* Results Grid */}
                    {displayedAbrechnungen.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <SpotlightCard className="max-w-md mx-auto p-12 border-dashed border-white/10 bg-transparent" spotlightColor="rgba(255, 255, 255, 0.05)">
                                <FileText className="mx-auto h-16 w-16 text-slate-600 mb-6" />
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Noch keine Abrechnungen
                                </h3>
                                <p className="text-slate-400 mb-8">
                                    Laden Sie Ihre erste Nebenkostenabrechnung hoch, um zu starten.
                                </p>
                                <Link to={createPageUrl("Upload")}>
                                    <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Erste Abrechnung hochladen
                                    </Button>
                                </Link>
                            </SpotlightCard>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            <AnimatePresence>
                                {displayedAbrechnungen.map((abrechnung, index) => (
                                    <motion.div
                                        key={abrechnung.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <SpotlightCard className="p-6 border-white/5 hover:border-blue-500/30 transition-colors group" spotlightColor="rgba(59, 130, 246, 0.1)">
                                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                                <div className="flex items-start gap-5 flex-1">
                                                    <div className={`p-4 rounded-2xl flex items-center justify-center transition-colors ${abrechnung.status === 'abgeschlossen' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        abrechnung.status === 'in_bearbeitung' ? 'bg-blue-500/10 text-blue-400' :
                                                            'bg-slate-800 text-slate-400'
                                                        }`}>
                                                        <FileText className="w-8 h-8" />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="font-bold text-lg text-white truncate group-hover:text-blue-400 transition-colors">
                                                                {abrechnung.titel || `Abrechnung ${abrechnung.abrechnungszeitraum || ''}`}
                                                            </h3>
                                                            <StatusBadge status={abrechnung.status} />
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 mb-3">
                                                            <span>{abrechnung.abrechnungszeitraum || 'Kein Zeitraum'}</span>
                                                            {abrechnung.verwalter && (
                                                                <>
                                                                    <span className="text-slate-600">•</span>
                                                                    <span>{abrechnung.verwalter}</span>
                                                                </>
                                                            )}
                                                            <span className="text-slate-600">•</span>
                                                            <span>
                                                                {format(new Date(abrechnung.created_date || abrechnung.created_at), "dd.MM.yyyy", { locale: de })}
                                                            </span>
                                                        </div>

                                                        <div>
                                                            {getAnalysisResult(abrechnung)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0 mt-2 md:mt-0">
                                                    {abrechnung.status === 'abgeschlossen' && (
                                                        <Link to={createPageUrl(`Bericht?id=${abrechnung.id}`)} className="flex-1 md:flex-none">
                                                            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                                                                Bericht ansehen
                                                                <ArrowRight className="ml-2 w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                                        onClick={() => openDeleteDialog(abrechnung)}
                                                        disabled={isDeleting}
                                                    >
                                                        {isDeleting && abrechnungToDelete?.id === abrechnung.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </SpotlightCard>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Abrechnung löschen?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            Möchten Sie die Abrechnung "{abrechnungToDelete?.titel}" wirklich dauerhaft löschen?
                            Diese Aktion kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting} className="bg-transparent border-white/10 text-white hover:bg-white/5">Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Wird gelöscht...
                                </>
                            ) : (
                                'Endgültig löschen'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}