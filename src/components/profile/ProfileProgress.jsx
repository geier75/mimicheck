/**
 * L2.4 - PROFIL-FORTSCHRITT KOMPONENTE
 * Zeigt Vollständigkeits-Score visuell an
 */

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { track, AREA } from '@/components/core/telemetry';

export default function ProfileProgress({ completionData }) {
    const { score, missingFields, filledFields, totalFields } = completionData;
    
    // Track when component mounts
    React.useEffect(() => {
        track('profile.progress.viewed', AREA.PROFILE, {
            score,
            filledFields,
            totalFields
        });
    }, [score, filledFields, totalFields]);
    
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-amber-600';
        return 'text-red-600';
    };
    
    const getScoreBadge = (score) => {
        if (score >= 80) return { label: 'Vollständig', color: 'bg-green-100 text-green-800 border-green-200' };
        if (score >= 50) return { label: 'Teilweise', color: 'bg-amber-100 text-amber-800 border-amber-200' };
        return { label: 'Unvollständig', color: 'bg-red-100 text-red-800 border-red-200' };
    };
    
    const badge = getScoreBadge(score);
    
    return (
        <Card className="border-none shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                                Profil-Vollständigkeit
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {filledFields} von {totalFields} Feldern ausgefüllt
                            </p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className={`text-4xl font-bold ${getScoreColor(score)} mb-1`}>
                            {score}%
                        </div>
                        <Badge className={badge.color}>
                            {badge.label}
                        </Badge>
                    </div>
                </div>
                
                <Progress value={score} className="h-3 mb-4" />
                
                {score < 100 && missingFields.length > 0 && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                                    Noch nicht ausgefüllt:
                                </h4>
                                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                                    {missingFields.map((field, idx) => (
                                        <li key={idx}>• {field}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
                
                {score === 100 && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <div>
                                <h4 className="font-semibold text-green-800 dark:text-green-300">
                                    Profil vollständig!
                                </h4>
                                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                    Sie können nun alle Förderungen optimal prüfen und Anträge automatisch ausfüllen lassen.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}