import { useState, useEffect } from 'react';
import { Foerderleistung } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
    Trash2, 
    CheckCircle, 
    AlertTriangle,
    Database,
    RefreshCw,
    Loader2
} from "lucide-react";

export default function DataCleanupExecution() {
    const [leistungen, setLeistungen] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletionProgress, setDeletionProgress] = useState(0);
    const [deletedCount, setDeletedCount] = useState(0);
    const [allDeleted, setAllDeleted] = useState(false);

    useEffect(() => {
        loadAllLeistungen();
    }, []);

    const loadAllLeistungen = async () => {
        setIsLoading(true);
        try {
            const all = await Foerderleistung.list();
            console.log('Geladene Förderleistungen:', all.length);
            setLeistungen(all);
        } catch (error) {
            console.error("Fehler beim Laden:", error);
        }
        setIsLoading(false);
    };

    const deleteAllLeistungen = async () => {
        if (leistungen.length === 0) {
            console.log('Keine Leistungen zu löschen');
            return;
        }

        setIsDeleting(true);
        setDeletionProgress(0);
        setDeletedCount(0);

        console.log(`Starte Löschung von ${leistungen.length} Förderleistungen...`);

        for (let i = 0; i < leistungen.length; i++) {
            const leistung = leistungen[i];
            
            try {
                console.log(`Lösche ${i + 1}/${leistungen.length}: ${leistung.titel} (ID: ${leistung.id})`);
                await Foerderleistung.delete(leistung.id);
                
                setDeletedCount(prev => prev + 1);
                setDeletionProgress(Math.round(((i + 1) / leistungen.length) * 100));
                
                // Kurze Pause zwischen Löschungen
                await new Promise(resolve => setTimeout(resolve, 50));
                
            } catch (error) {
                console.error(`Fehler beim Löschen von "${leistung.titel}":`, error);
            }
        }

        console.log(`Löschung abgeschlossen. ${leistungen.length} Einträge verarbeitet.`);
        setAllDeleted(true);
        setIsDeleting(false);
        
        // Nach Löschung neu laden um zu prüfen
        setTimeout(loadAllLeistungen, 1000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-slate-600">Lade Förderleistungen...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto">
                <Card className="border-red-200 shadow-xl">
                    <CardHeader className="bg-red-50 border-b">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                                <Database className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold text-red-800">
                                    Datenbank komplett leeren
                                </CardTitle>
                                <p className="text-slate-600">
                                    Aktuell {leistungen.length} Förderleistungen in der Datenbank
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-8">
                        {!isDeleting && !allDeleted && (
                            <div className="space-y-6">
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>WARNUNG:</strong> Dieser Vorgang löscht alle {leistungen.length} Förderleistungen 
                                        unwiderruflich aus der Datenbank. Die Aktion kann nicht rückgängig gemacht werden.
                                    </AlertDescription>
                                </Alert>

                                {/* Übersicht der zu löschenden Einträge */}
                                <div className="bg-slate-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                                    <h3 className="font-semibold mb-3">Zu löschende Einträge:</h3>
                                    <div className="space-y-1 text-sm">
                                        {leistungen.map((leistung, index) => (
                                            <div key={leistung.id} className="flex justify-between">
                                                <span>{index + 1}. {leistung.titel}</span>
                                                <span className="text-slate-500">ID: {leistung.id}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 justify-center">
                                    <Button
                                        onClick={loadAllLeistungen}
                                        variant="outline"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Aktualisieren
                                    </Button>
                                    
                                    <Button
                                        onClick={deleteAllLeistungen}
                                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                                        size="lg"
                                    >
                                        <Trash2 className="w-5 h-5 mr-2" />
                                        ALLE {leistungen.length} LÖSCHEN
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isDeleting && (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                    <Trash2 className="w-8 h-8 text-white" />
                                </div>
                                
                                <h3 className="text-xl font-bold">Löschung in Bearbeitung...</h3>
                                
                                <div className="space-y-2">
                                    <Progress value={deletionProgress} className="w-full max-w-md mx-auto" />
                                    <p className="text-lg font-semibold">
                                        {deletedCount} von {leistungen.length} gelöscht ({deletionProgress}%)
                                    </p>
                                </div>
                                
                                <p className="text-slate-600">
                                    Bitte warten Sie, bis alle Einträge entfernt wurden...
                                </p>
                            </div>
                        )}

                        {allDeleted && (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8 text-white" />
                                </div>
                                
                                <h3 className="text-2xl font-bold text-green-800">
                                    Löschung abgeschlossen!
                                </h3>
                                
                                <p className="text-lg">
                                    <strong>{deletedCount}</strong> Förderleistungen wurden gelöscht.
                                </p>
                                
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-green-800">
                                        Die Datenbank ist jetzt leer. Sie können beginnen, 
                                        neue Förderleistungen Schritt für Schritt hinzuzufügen.
                                    </p>
                                </div>

                                <Button
                                    onClick={loadAllLeistungen}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Status prüfen
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}