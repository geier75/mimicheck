// Integrierte Test-Engine für deterministische Anspruchsprüfung
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, FileText } from "lucide-react";

// Deterministische Regel-Engine (Production-Quality)
export const pruefeAnspruch = (leistung, user) => {
    if (!user?.lebenssituation) {
        return { 
            status: 'unvollstaendiges_profil', 
            begruendung: 'Bitte vervollständigen Sie Ihre Lebenslage-Daten für eine genaue Prüfung.',
            confidence: 'niedrig',
            score: 0,
            checks: []
        };
    }

    const { lebenssituation } = user;
    const checks = [];
    let score = 5; // Basis-Score

    // Test Case 1: Einkommensprüfung
    if (leistung.einkommensgrenzen) {
        const maxEinkommen = calculateMaxEinkommen(leistung.einkommensgrenzen, lebenssituation);
        const istEinkommen = lebenssituation.monatliches_nettoeinkommen || 0;
        
        if (istEinkommen > maxEinkommen) {
            checks.push({
                kriterium: 'Einkommensgrenze',
                erfuellt: false,
                details: `Ihr Einkommen (${istEinkommen}€) überschreitet die Grenze (${maxEinkommen}€)`,
                test_result: 'FAIL'
            });
            return { 
                status: 'anspruch_unwahrscheinlich', 
                begruendung: `Ihr Einkommen überschreitet wahrscheinlich die zulässige Grenze von ${maxEinkommen}€.`,
                confidence: 'hoch',
                score: 1,
                checks
            };
        } else {
            checks.push({
                kriterium: 'Einkommensgrenze',
                erfuellt: true,
                details: `Ihr Einkommen liegt unter der Grenze (${istEinkommen}€ < ${maxEinkommen}€)`,
                test_result: 'PASS'
            });
            score += 3;
        }
    }

    // Test Case 2: Wohnsituation-Prüfung
    if (leistung.wohnsituation_kriterien) {
        if (leistung.wohnsituation_kriterien.nur_mieter && lebenssituation.wohnart !== 'miete') {
            checks.push({
                kriterium: 'Wohnart',
                erfuellt: false,
                details: `Diese Leistung ist nur für Mieter verfügbar`,
                test_result: 'FAIL'
            });
            return { 
                status: 'anspruch_unwahrscheinlich', 
                begruendung: 'Diese Leistung ist nur für Mieter verfügbar.',
                confidence: 'hoch',
                score: 1,
                checks
            };
        } else if (leistung.wohnsituation_kriterien.nur_mieter) {
            checks.push({
                kriterium: 'Wohnart',
                erfuellt: true,
                details: 'Sie sind Mieter - Kriterium erfüllt',
                test_result: 'PASS'
            });
            score += 1;
        }
    }

    // Test Case 3: Familie-Prüfung
    if (leistung.familie_kriterien) {
        if (leistung.familie_kriterien.min_kinder && 
            lebenssituation.kinder_anzahl < leistung.familie_kriterien.min_kinder) {
            checks.push({
                kriterium: 'Mindestanzahl Kinder',
                erfuellt: false,
                details: `Diese Leistung erfordert mindestens ${leistung.familie_kriterien.min_kinder} Kind(er)`,
                test_result: 'FAIL'
            });
            return { 
                status: 'anspruch_unwahrscheinlich', 
                begruendung: `Diese Leistung erfordert mindestens ${leistung.familie_kriterien.min_kinder} Kind(er).`,
                confidence: 'hoch',
                score: 1,
                checks
            };
        } else if (leistung.familie_kriterien.min_kinder) {
            checks.push({
                kriterium: 'Mindestanzahl Kinder',
                erfuellt: true,
                details: 'Kinderanzahl erfüllt Kriterium',
                test_result: 'PASS'
            });
            score += 2;
        }
    }

    // Ergebnis basierend auf Test-Score
    if (score >= 7) {
        return {
            status: 'anspruch_wahrscheinlich',
            begruendung: 'Basierend auf Ihren Angaben besteht eine hohe Wahrscheinlichkeit für einen Anspruch.',
            confidence: 'hoch',
            score,
            checks
        };
    } else if (score >= 4) {
        return {
            status: 'anspruch_moeglich',
            begruendung: 'Ein Anspruch ist möglich, sollte aber genauer geprüft werden.',
            confidence: 'mittel',
            score,
            checks
        };
    } else {
        return {
            status: 'weitere_pruefung_noetig',
            begruendung: 'Bitte wenden Sie sich an die zuständige Behörde für eine detaillierte Prüfung.',
            confidence: 'niedrig',
            score,
            checks
        };
    }
};

const calculateMaxEinkommen = (einkommensgrenzen, lebenssituation) => {
    const personen = lebenssituation.haushaltsmitglieder_anzahl || 1;
    
    if (personen === 1) {
        return einkommensgrenzen.max_nettoeinkommen_1_person || 2000;
    } else if (personen === 2) {
        return einkommensgrenzen.max_nettoeinkommen_2_personen || 3000;
    } else {
        const basis = einkommensgrenzen.max_nettoeinkommen_2_personen || 3000;
        const zusatz = (personen - 2) * (einkommensgrenzen.max_nettoeinkommen_pro_weiterer_person || 500);
        return basis + zusatz;
    }
};

// Production Component mit integrierter Test-Visualisierung
export default function AnspruchsPruefung({ leistung, user, onResult }) {
    const [testResults, setTestResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    const runQualityCheck = async () => {
        setIsRunning(true);
        
        // Führe deterministische Prüfung durch
        const result = pruefeAnspruch(leistung, user);
        
        // Simulate processing time for UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTestResults(result);
        setIsRunning(false);
        
        if (onResult) {
            onResult(result);
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'anspruch_wahrscheinlich': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'anspruch_unwahrscheinlich': return <XCircle className="w-5 h-5 text-red-600" />;
            default: return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'anspruch_wahrscheinlich': return 'bg-green-100 text-green-800';
            case 'anspruch_unwahrscheinlich': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Anspruchsprüfung: {leistung.titel}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!testResults && (
                    <Button 
                        onClick={runQualityCheck}
                        disabled={isRunning}
                        className="w-full"
                    >
                        {isRunning ? 'Prüfung läuft...' : 'Anspruch prüfen'}
                    </Button>
                )}

                {testResults && (
                    <div className="space-y-4">
                        <Alert>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(testResults.status)}
                                <AlertDescription>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className={getStatusColor(testResults.status)}>
                                            {testResults.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                        <Badge variant="outline">
                                            Konfidenz: {testResults.confidence}
                                        </Badge>
                                        <Badge variant="outline">
                                            Score: {testResults.score}/10
                                        </Badge>
                                    </div>
                                    {testResults.begruendung}
                                </AlertDescription>
                            </div>
                        </Alert>

                        {testResults.checks && testResults.checks.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold">Detaillierte Prüfungsergebnisse:</h4>
                                {testResults.checks.map((check, index) => (
                                    <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                        {check.erfuellt ? 
                                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" /> : 
                                            <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                        }
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <strong>{check.kriterium}</strong>
                                                <Badge variant={check.erfuellt ? "default" : "destructive"} className="text-xs">
                                                    {check.test_result}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{check.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}