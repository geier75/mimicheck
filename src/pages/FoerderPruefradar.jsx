import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

import InputForm from "../components/pruefradar/InputForm";
import ResultsDisplay from "../components/pruefradar/ResultsDisplay";
import { evaluateAllFoerderungen } from "../components/foerderungsRechner";

export default function FoerderPruefradar() {
    const [results, setResults] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const handleCalculate = (data) => {
        setIsCalculating(true);
        setTimeout(() => {
            const evaluationResults = evaluateAllFoerderungen(data);
            setResults(evaluationResults);
            setIsCalculating(false);
            if (window.innerWidth < 768) {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        }, 500);
    };

    return (
        <div 
            className="min-h-screen relative overflow-hidden"
            style={{
                backgroundImage: "url('/uploads/20250726_1711_Cyberpunk German Emblem_simple_compose_01k13mh0awf0st6e14qcf1rj4b.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Overlay für Abdunklung und Unschärfe */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
            
            {/* Content Container */}
            <div className="relative z-10 p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header Card */}
                    <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-md">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <ListChecks className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                        Förder-Prüfradar
                                    </CardTitle>
                                    <p className="text-slate-700 mt-1 font-medium">
                                        Geben Sie Ihre Haushaltsdaten ein, um potenzielle Ansprüche zu ermitteln.
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <InputForm onSubmit={handleCalculate} isCalculating={isCalculating} />
                        </CardContent>
                    </Card>

                    {/* Results */}
                    {results && (
                        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
                            <ResultsDisplay results={results} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}