// Produktive Datenqualitäts-Überwachung
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Foerderleistung } from "@/api/entities";
import { Shield, AlertTriangle, CheckCircle, Database, RefreshCw } from "lucide-react";

export default function DataIntegrityMonitor() {
    const [integrityStatus, setIntegrityStatus] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [lastCheck, setLastCheck] = useState(null);

    const runIntegrityCheck = async () => {
        setIsChecking(true);
        const startTime = Date.now();

        try {
            // Test Case 1: Duplikate in Förderleistungen
            const allLeistungen = await Foerderleistung.list();
            
            const typCounts = allLeistungen.reduce((acc, leistung) => {
                acc[leistung.typ] = (acc[leistung.typ] || 0) + 1;
                return acc;
            }, {});

            const duplicates = Object.entries(typCounts).filter(([typ, count]) => count > 1);

            // Test Case 2: Pflichtfelder-Validierung
            const requiredFields = ['titel', 'typ', 'kategorie', 'kurzbeschreibung'];
            const missingFields = [];
            
            allLeistungen.forEach((leistung, index) => {
                requiredFields.forEach(field => {
                    if (!leistung[field] || leistung[field] === '') {
                        missingFields.push(`Leistung ${index + 1}: Fehlendes Feld '${field}'`);
                    }
                });
            });

            // Test Case 3: URL-Validierung
            const invalidUrls = [];
            const urlRegex = /^https?:\/\/.+/;
            
            allLeistungen.forEach((leistung, index) => {
                if (leistung.antrag_url && !urlRegex.test(leistung.antrag_url)) {
                    invalidUrls.push(`Leistung ${index + 1}: Ungültige antrag_url`);
                }
                if (leistung.info_url && !urlRegex.test(leistung.info_url)) {
                    invalidUrls.push(`Leistung ${index + 1}: Ungültige info_url`);
                }
            });

            // Test Case 4: Kategorie-Standardisierung
            const validKategorien = [
                'Wohnen & Miete', 'Familie & Kinder', 'Bildung & Arbeit',
                'Steuern & Finanzen', 'Rente & Alter', 'Gesundheit & Pflege',
                'Energie & Klima', 'Selbstständigkeit'
            ];
            
            const invalidKategorien = allLeistungen.filter(l => 
                !validKategorien.includes(l.kategorie)
            ).map(l => `${l.titel}: '${l.kategorie}'`);

            const executionTime = Date.now() - startTime;

            const status = {
                totalRecords: allLeistungen.length,
                duplicates: duplicates.length,
                duplicateDetails: duplicates,
                missingFields: missingFields.length,
                missingFieldDetails: missingFields.slice(0, 5), // Max 5 für UI
                invalidUrls: invalidUrls.length,
                invalidUrlDetails: invalidUrls.slice(0, 5),
                invalidCategories: invalidKategorien.length,
                invalidCategoryDetails: invalidKategorien.slice(0, 5),
                executionTime,
                timestamp: new Date().toISOString(),
                overallHealth: duplicates.length === 0 && missingFields.length === 0 && invalidUrls.length === 0 && invalidKategorien.length === 0 ? 'HEALTHY' : 'ISSUES_FOUND'
            };

            setIntegrityStatus(status);
            setLastCheck(new Date());

        } catch (error) {
            setIntegrityStatus({
                error: error.message,
                overallHealth: 'ERROR',
                timestamp: new Date().toISOString()
            });
        }

        setIsChecking(false);
    };

    useEffect(() => {
        // Auto-run on mount
        runIntegrityCheck();
    }, []);

    const getHealthIcon = (health) => {
        switch(health) {
            case 'HEALTHY': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'ISSUES_FOUND': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
            case 'ERROR': return <Shield className="w-5 h-5 text-red-600" />;
            default: return <Database className="w-5 h-5 text-gray-600" />;
        }
    };

    const getHealthColor = (health) => {
        switch(health) {
            case 'HEALTHY': return 'bg-green-100 text-green-800';
            case 'ISSUES_FOUND': return 'bg-yellow-100 text-yellow-800';
            case 'ERROR': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Datenqualitäts-Monitor
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={runIntegrityCheck}
                        disabled={isChecking}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                        {isChecking ? 'Prüfung...' : 'Neu prüfen'}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!integrityStatus && isChecking && (
                    <Alert>
                        <AlertDescription>
                            Datenintegrität wird geprüft...
                        </AlertDescription>
                    </Alert>
                )}

                {integrityStatus && (
                    <div className="space-y-4">
                        <Alert>
                            <div className="flex items-center gap-2">
                                {getHealthIcon(integrityStatus.overallHealth)}
                                <AlertDescription>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className={getHealthColor(integrityStatus.overallHealth)}>
                                            {integrityStatus.overallHealth}
                                        </Badge>
                                        {integrityStatus.executionTime && (
                                            <Badge variant="outline">
                                                {integrityStatus.executionTime}ms
                                            </Badge>
                                        )}
                                        {integrityStatus.totalRecords && (
                                            <Badge variant="outline">
                                                {integrityStatus.totalRecords} Datensätze
                                            </Badge>
                                        )}
                                    </div>
                                    {integrityStatus.error ? 
                                        `Fehler: ${integrityStatus.error}` :
                                        `Datenqualitätsprüfung abgeschlossen`
                                    }
                                </AlertDescription>
                            </div>
                        </Alert>

                        {integrityStatus.overallHealth === 'ISSUES_FOUND' && (
                            <div className="space-y-3">
                                {integrityStatus.duplicates > 0 && (
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <h4 className="font-semibold text-red-800 mb-2">
                                            🚨 Duplikate gefunden: {integrityStatus.duplicates}
                                        </h4>
                                        {integrityStatus.duplicateDetails.map(([typ, count], index) => (
                                            <p key={index} className="text-sm text-red-700">
                                                • {typ}: {count} Einträge
                                            </p>
                                        ))}
                                    </div>
                                )}

                                {integrityStatus.missingFields > 0 && (
                                    <div className="p-3 bg-yellow-50 rounded-lg">
                                        <h4 className="font-semibold text-yellow-800 mb-2">
                                            ⚠️ Fehlende Pflichtfelder: {integrityStatus.missingFields}
                                        </h4>
                                        {integrityStatus.missingFieldDetails.map((issue, index) => (
                                            <p key={index} className="text-sm text-yellow-700">
                                                • {issue}
                                            </p>
                                        ))}
                                    </div>
                                )}

                                {integrityStatus.invalidUrls > 0 && (
                                    <div className="p-3 bg-orange-50 rounded-lg">
                                        <h4 className="font-semibold text-orange-800 mb-2">
                                            🔗 Ungültige URLs: {integrityStatus.invalidUrls}
                                        </h4>
                                        {integrityStatus.invalidUrlDetails.map((issue, index) => (
                                            <p key={index} className="text-sm text-orange-700">
                                                • {issue}
                                            </p>
                                        ))}
                                    </div>
                                )}

                                {integrityStatus.invalidCategories > 0 && (
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <h4 className="font-semibold text-purple-800 mb-2">
                                            📂 Ungültige Kategorien: {integrityStatus.invalidCategories}
                                        </h4>
                                        {integrityStatus.invalidCategoryDetails.map((issue, index) => (
                                            <p key={index} className="text-sm text-purple-700">
                                                • {issue}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {integrityStatus.overallHealth === 'HEALTHY' && (
                            <div className="p-3 bg-green-50 rounded-lg">
                                <h4 className="font-semibold text-green-800 mb-2">
                                    ✅ Alle Qualitätsprüfungen erfolgreich
                                </h4>
                                <p className="text-sm text-green-700">
                                    Keine Duplikate, alle Pflichtfelder vorhanden, URLs valide, Kategorien standardisiert.
                                </p>
                            </div>
                        )}

                        {lastCheck && (
                            <p className="text-xs text-gray-500">
                                Letzte Prüfung: {lastCheck.toLocaleString()}
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}