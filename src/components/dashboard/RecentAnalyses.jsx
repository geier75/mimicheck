import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    FileText,
    Eye,
    AlertCircle,
    CheckCircle,
    Clock,
    ArrowRight
} from "lucide-react";
import { format } from 'date-fns';

export default function RecentAnalyses({ abrechnungen, isLoading }) {
    if (isLoading) {
        return (
            <Card className="border-none shadow-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl glass-morphism">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 humanistic-serif">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        Letzte Analysen
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array(3).fill(0).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg mb-2"></div>
                                <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!abrechnungen || abrechnungen.length === 0) {
        return (
            <Card className="border-none shadow-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl glass-morphism">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 humanistic-serif">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        Letzte Analysen
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-3xl flex items-center justify-center">
                        <FileText className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 humanistic-serif">
                        Noch keine Analysen
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                        Laden Sie Ihre erste Nebenkostenabrechnung hoch für eine kostenlose Analyse
                    </p>
                    <Link to={createPageUrl("Upload")}>
                        <Button className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white border-none px-8 py-3 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                            <FileText className="w-5 h-5 mr-2" />
                            Erste Analyse starten
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'abgeschlossen':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'in_bearbeitung':
                return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
            case 'fehler':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'abgeschlossen':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in_bearbeitung':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'fehler':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <Card className="border-none shadow-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl glass-morphism">
            <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 humanistic-serif">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        Letzte Analysen
                    </CardTitle>
                    <Link to={createPageUrl("Abrechnungen")}>
                        <Button variant="ghost" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            Alle anzeigen
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="space-y-0">
                    {abrechnungen.slice(0, 5).map((abrechnung, index) => (
                        <div key={abrechnung.id} 
                             className="p-6 hover:bg-white/40 dark:hover:bg-slate-700/40 transition-all duration-300 border-b border-white/10 last:border-b-0 card-3d group">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusIcon(abrechnung.analyse_status)}
                                        <h3 className="font-bold text-slate-800 dark:text-white text-lg humanistic-serif group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {abrechnung.titel || `Abrechnung ${abrechnung.abrechnungszeitraum}`}
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                        <span>{abrechnung.abrechnungszeitraum}</span>
                                        {abrechnung.verwalter && <span>• {abrechnung.verwalter}</span>}
                                        {abrechnung.upload_datum && (
                                            <span>• {format(new Date(abrechnung.upload_datum), 'dd.MM.yyyy')}</span>
                                        )}
                                    </div>
                                    {abrechnung.rueckforderung_potential > 0 && (
                                        <div className="mt-3">
                                            <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-none">
                                                💰 {abrechnung.rueckforderung_potential.toFixed(0)}€ Rückforderung möglich
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <Badge className={getStatusColor(abrechnung.analyse_status)}>
                                        {abrechnung.analyse_status === 'abgeschlossen' ? 'Abgeschlossen' :
                                         abrechnung.analyse_status === 'in_bearbeitung' ? 'In Bearbeitung' :
                                         abrechnung.analyse_status === 'fehler' ? 'Fehler' : 'Wartend'}
                                    </Badge>
                                    
                                    {abrechnung.analyse_status === 'abgeschlossen' && (
                                        <Link to={createPageUrl(`Bericht?id=${abrechnung.id}`)}>
                                            <Button className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white border-none px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                                                <Eye className="w-4 h-4 mr-2" />
                                                Bericht
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}