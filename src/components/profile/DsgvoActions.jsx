import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Trash2, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { mimitech } from '@/api/mimitechClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DsgvoActions() {
    const [isExporting, setIsExporting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const navigate = useNavigate();

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await mimitech.functions.invoke('exportUserData', {});
            
            // Blob aus Response erstellen
            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            
            // Download auslösen
            const a = document.createElement('a');
            a.href = url;
            a.download = `staatshilfen_datenexport_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            console.log('Datenexport erfolgreich');
        } catch (error) {
            console.error('Fehler beim Datenexport:', error);
            alert('Fehler beim Erstellen des Datenexports. Bitte versuchen Sie es später erneut.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = async () => {
        if (deleteConfirmation !== 'DELETE') {
            setDeleteError('Bitte geben Sie "DELETE" exakt ein.');
            return;
        }

        setIsDeleting(true);
        setDeleteError('');

        try {
            const response = await mimitech.functions.invoke('deleteUserAccount', {
                confirmation: deleteConfirmation
            });

            if (response.data.success) {
                // Erfolg - zur Landing Page redirecten
                alert('Ihr Konto wurde erfolgreich gelöscht. Sie werden nun abgemeldet.');
                window.location.href = createPageUrl('LandingPage');
            }
        } catch (error) {
            console.error('Fehler beim Löschen:', error);
            setDeleteError(error.response?.data?.message || 'Fehler beim Löschen des Kontos. Bitte kontaktieren Sie den Support.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-white">
                    <Shield className="w-6 h-6 text-red-600" />
                    Datenschutz & Kontoverwaltung (DSGVO)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                            <Download className="w-5 h-5 text-blue-600" />
                            Daten exportieren
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Laden Sie alle Ihre gespeicherten Daten als ZIP-Archiv herunter. 
                            Dies umfasst Ihr Profil, alle hochgeladenen Abrechnungen und Analysen.
                        </p>
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Exportiere Daten...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Daten exportieren (ZIP)
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Gemäß Art. 15 DSGVO (Recht auf Auskunft)
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 space-y-4 border-2 border-red-200 dark:border-red-800">
                    <div>
                        <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            Konto löschen
                        </h3>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-800 dark:text-red-300">
                                    <p className="font-semibold mb-1">⚠️ Diese Aktion kann nicht rückgängig gemacht werden!</p>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        <li>Ihr Profil wird unwiderruflich gelöscht</li>
                                        <li>Alle hochgeladenen Abrechnungen werden entfernt</li>
                                        <li>Alle Analysen und Berichte werden gelöscht</li>
                                        <li>Sie können sich nicht mehr anmelden</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Wenn Sie Ihr Konto wirklich löschen möchten, klicken Sie auf den Button unten.
                        </p>
                        <Button
                            onClick={() => setShowDeleteDialog(true)}
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Konto unwiderruflich löschen
                        </Button>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Gemäß Art. 17 DSGVO (Recht auf Löschung / "Recht auf Vergessenwerden")
                        </p>
                    </div>
                </div>

                {/* Bestätigungsdialog für Löschung */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="w-5 h-5" />
                                Konto wirklich löschen?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-4">
                                <p>
                                    Diese Aktion kann <strong>nicht rückgängig</strong> gemacht werden. 
                                    Alle Ihre Daten werden unwiderruflich gelöscht.
                                </p>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                    <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                                        Um fortzufahren, geben Sie bitte <strong>DELETE</strong> ein:
                                    </p>
                                    <Input
                                        type="text"
                                        placeholder="DELETE"
                                        value={deleteConfirmation}
                                        onChange={(e) => {
                                            setDeleteConfirmation(e.target.value);
                                            setDeleteError('');
                                        }}
                                        className="font-mono"
                                    />
                                    {deleteError && (
                                        <p className="text-sm text-red-600 mt-2">{deleteError}</p>
                                    )}
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel 
                                onClick={() => {
                                    setDeleteConfirmation('');
                                    setDeleteError('');
                                }}
                                disabled={isDeleting}
                            >
                                Abbrechen
                            </AlertDialogCancel>
                            <Button
                                onClick={handleDelete}
                                disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Lösche Konto...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Endgültig löschen
                                    </>
                                )}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}