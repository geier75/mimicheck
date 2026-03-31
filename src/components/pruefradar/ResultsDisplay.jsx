
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, Euro, Info, Home, Users, Flame, BookOpen, FileText } from "lucide-react";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

// Helfer-Funktion, um ein Icon basierend auf der Kategorie zu erhalten
const getCategoryIcon = (category) => {
    switch (category) {
        case "Wohnen & Miete": return <Home className="w-5 h-5 text-blue-600" />;
        case "Familie & Kinder": return <Users className="w-5 h-5 text-purple-600" />;
        case "Energie & Klima": return <Flame className="w-5 h-5 text-orange-600" />;
        case "Bildung & Arbeit": return <BookOpen className="w-5 h-5 text-teal-600" />;
        case "Gesundheit & Pflege": return <FileText className="w-5 h-5 text-rose-600" />;
        default: return <Info className="w-5 h-5 text-gray-600" />;
    }
};

// Generische Komponente für eine einzelne Ergebnis-Karte
const ResultCard = ({ result }) => {
    const { eligibilityResult, titel, kategorie, typ, antrag_url } = result;
    const { eligible, amount, reason } = eligibilityResult;

    const getStatusIcon = (isEligible) => {
        if (isEligible === true) return <CheckCircle className="w-5 h-5 text-green-600" />;
        if (isEligible === false) return <XCircle className="w-5 h-5 text-red-600" />;
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    };

    const getStatusColor = (isEligible) => {
        if (isEligible === true) return "border-green-200 bg-green-50/80";
        if (isEligible === false) return "border-red-200 bg-red-50/80";
        return "border-yellow-200 bg-yellow-50/80";
    };

    return (
        <Card className={`border shadow-xl bg-white/90 backdrop-blur-md ${getStatusColor(eligible)} flex flex-col`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getCategoryIcon(kategorie)}
                        <CardTitle className="text-lg">{titel}</CardTitle>
                    </div>
                    {getStatusIcon(eligible)}
                </div>
            </CardHeader>
            <CardContent className="space-y-3 flex-grow flex flex-col justify-between">
                <div>
                    {eligible && amount > 0 && (
                        <div className="text-center p-4 bg-white/50 rounded-lg mb-3">
                            <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-1">
                                <Euro className="w-6 h-6" />
                                {amount}
                            </div>
                            <div className="text-sm text-slate-600 mt-1">Potenzieller Anspruch</div>
                        </div>
                    )}
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            {reason}
                        </AlertDescription>
                    </Alert>
                </div>
                
                <div className="flex gap-2 mt-4">
                    <Link to={createPageUrl(`Pruefung?type=${typ}`)} className="flex-1">
                        <Button variant="outline" className="w-full">
                            Details anzeigen
                        </Button>
                    </Link>
                    {antrag_url && eligible === true && (
                        <Button 
                            variant="default"
                            className="flex-1"
                            onClick={() => window.open(antrag_url, '_blank')}
                        >
                            Antrag stellen
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default function ResultsDisplay({ results }) {
    if (!results || results.length === 0) {
        return (
             <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Keine passenden Förderungen
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-slate-600">
                    <p>Basierend auf Ihren Angaben konnten keine passenden Förderungen gefunden werden. Versuchen Sie es mit anderen Eingaben oder vervollständigen Sie Ihr Profil.</p>
                </CardContent>
            </Card>
        );
    }
    
    const eligibleResults = results.filter(r => r.eligibilityResult.eligible);
    const otherResults = results.filter(r => !r.eligibilityResult.eligible);
    const totalMonthly = eligibleResults.reduce((sum, r) => sum + (r.eligibilityResult.amount || 0), 0);

    const formatCurrency = (amount) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Ihre Förderansprüche im Überblick
                    </CardTitle>
                </CardHeader>
            </Card>

            {totalMonthly > 0 && (
                 <Card className="border-none shadow-2xl bg-gradient-to-r from-cyan-50 to-blue-50 backdrop-blur-md">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Geschätztes Gesamtpotential</h3>
                            <div className="text-4xl font-bold text-green-600 mb-2">
                                {formatCurrency(totalMonthly)} / Monat
                            </div>
                            <p className="text-slate-600">
                                Basierend auf Ihren Angaben könnten Sie monatlich bis zu {formatCurrency(totalMonthly)} an Förderungen erhalten.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-8">
                {eligibleResults.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Mögliche Ansprüche ({eligibleResults.length})</h3>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {eligibleResults.map(result => <ResultCard key={result.typ} result={result} />)}
                        </div>
                    </div>
                )}
                
                {otherResults.length > 0 && (
                    <div className="pt-6">
                        <h3 className="text-xl font-bold text-white mb-4">Weitere geprüfte Leistungen ({otherResults.length})</h3>
                         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {otherResults.map(result => <ResultCard key={result.typ} result={result} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
