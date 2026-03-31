import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ExternalLink,
    Sparkles,
    Euro,
    Clock,
    User as UserIcon,
    AlertTriangle,
    CheckCircle,
    Chrome
} from 'lucide-react';

export default function ApplicationCard({ app, user, onDownload, searchTerm }) {
    const isEligible = checkEligibility(app, user);

    const highlightSearch = (text, term) => {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900">$1</mark>');
    };

    // Prüfen ob PDF-Autofill ODER Web-Assistent verfügbar ist
    const hasPdfAutofill = ['buergergeld', 'wohngeld'].includes(app.id);
    const hasWebAssistant = ['arbeitslosengeld', 'krankengeld'].includes(app.id);

    return (
        <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                                app.priority === 'sehr_hoch' ? 'bg-gradient-to-br from-red-600 to-pink-600' :
                                app.priority === 'hoch' ? 'bg-gradient-to-br from-red-500 to-orange-500' :
                                'bg-gradient-to-br from-blue-500 to-indigo-500'
                            }`}>
                                <app.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">
                                    <span dangerouslySetInnerHTML={{
                                        __html: highlightSearch(app.title, searchTerm)
                                    }} />
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                                        {app.category}
                                    </Badge>
                                    {app.monthlyAmount && (
                                        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs">
                                            <Euro className="w-3 h-3 mr-1" />
                                            {app.monthlyAmount}
                                        </Badge>
                                    )}
                                    {hasPdfAutofill && (
                                        <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs">
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            KI-Autofill (PDF)
                                        </Badge>
                                    )}
                                    {hasWebAssistant && (
                                        <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs">
                                            <Chrome className="w-3 h-3 mr-1" />
                                            Web-Assistent
                                        </Badge>
                                    )}
                                    {isEligible ? (
                                        <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Empfohlen für Sie
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Profil prüfen
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                            <span dangerouslySetInnerHTML={{
                                __html: highlightSearch(app.description, searchTerm)
                            }} />
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Key Information */}
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-slate-50/60 dark:bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            {app.processingTime}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            {app.officialSource}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            {app.targetGroups.length} Zielgruppen
                        </span>
                    </div>
                </div>

                {/* Required Documents Preview */}
                <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
                        📋 Benötigte Unterlagen:
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-hidden">
                        {app.requiredDocuments.slice(0, 3).map((doc, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                                <span>{doc}</span>
                            </div>
                        ))}
                        {app.requiredDocuments.length > 3 && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic ml-4">
                                +{app.requiredDocuments.length - 3} weitere Dokumente
                            </p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={() => onDownload(app)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Zur offiziellen Quelle
                    </Button>

                    {hasPdfAutofill ? (
                        <Link to={createPageUrl(`PdfAutofill?type=${app.id}`)} className="flex-1">
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                                <Sparkles className="w-4 h-4 mr-2" />
                                KI-Autofill (PDF)
                            </Button>
                        </Link>
                    ) : hasWebAssistant ? (
                        <Link to={createPageUrl(`WebAssistent?type=${app.id}`)} className="flex-1">
                            <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                                <Chrome className="w-4 h-4 mr-2" />
                                Web-Assistent
                            </Button>
                        </Link>
                    ) : (
                        <Button variant="outline" disabled className="flex-1">
                            <Sparkles className="w-4 h-4 mr-2 opacity-50" />
                            Hilfe bald verfügbar
                        </Button>
                    )}
                </div>

                {/* Smart Recommendation */}
                {isEligible && (
                    <div className="p-4 bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                                KI-Empfehlung
                            </span>
                        </div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                            Basierend auf Ihrem Profil haben Sie gute Chancen auf diese Leistung.
                            {hasPdfAutofill && ' Nutzen Sie den KI-Autofill für schnelles Ausfüllen.'}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Helper function
function checkEligibility(app, user) {
    if (!user?.lebenssituation) return false;

    const { beschaeftigungsstatus, monatliches_nettoeinkommen, kinder_anzahl, familienstand } = user.lebenssituation;

    switch(app.id) {
        case 'buergergeld':
            return beschaeftigungsstatus === 'arbeitslos' || (monatliches_nettoeinkommen && monatliches_nettoeinkommen < 1200);
        case 'arbeitslosengeld':
            return beschaeftigungsstatus === 'arbeitslos';
        case 'kindergeld':
            return kinder_anzahl > 0;
        case 'wohngeld':
            return monatliches_nettoeinkommen > 0 && monatliches_nettoeinkommen < 3000;
        case 'krankengeld':
            return beschaeftigungsstatus === 'krank';
        default:
            return false;
    }
}