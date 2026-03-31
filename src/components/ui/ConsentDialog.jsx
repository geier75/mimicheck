import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Database, Bot } from 'lucide-react';

export default function ConsentDialog({ isOpen, onConfirm, onCancel }) {
    return (
        <Dialog open={isOpen}>
            <DialogContent className="max-w-lg border-none shadow-2xl glass-morphism">
                <DialogHeader>
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-center text-slate-800 dark:text-white humanistic-serif">
                        Ihr Einverständnis ist erforderlich
                    </DialogTitle>
                    <DialogDescription className="text-center text-slate-600 dark:text-slate-300 pt-2">
                        Für die Analyse Ihrer Ansprüche benötigen wir Ihre Erlaubnis zur Verarbeitung Ihrer Daten.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex items-start gap-4">
                        <Database className="w-5 h-5 mt-1 text-blue-500 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">Datenspeicherung</h4>
                            <p>Ihre eingegebenen Daten werden sicher und verschlüsselt auf Servern in der EU gespeichert.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Bot className="w-5 h-5 mt-1 text-purple-500 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">KI-Analyse</h4>
                            <p>Unsere KI nutzt Ihre anonymisierten Daten, um passende Förderungen zu finden und Anträge vorzubereiten. Es werden keine persönlichen Daten an Dritte verkauft.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <ShieldCheck className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">Ihre Kontrolle</h4>
                            <p>Sie können Ihre Daten jederzeit einsehen, ändern und die Löschung beantragen. Ihre Zustimmung können Sie jederzeit widerrufen.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onCancel}>Später entscheiden</Button>
                    <Button 
                        onClick={onConfirm}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    >
                        Ich stimme zu & Fortfahren
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}