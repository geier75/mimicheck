/**
 * B5.1 - PERSONALISIERTER MUSTERBRIEF
 * Dynamisch generierter, voll personalisierter Widerspruchsbrief
 */

import React from 'react';
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Copy, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { track, AREA } from '@/components/core/telemetry';

export default function Musterbrief({ abrechnung, user }) {
    const today = format(new Date(), "dd. MMMM yyyy", { locale: de });
    
    // Calculate total savings
    const totalSavings = abrechnung.analyse_ergebnis?.fehler?.reduce(
        (sum, fehler) => sum + (fehler.betrag || 0), 
        0
    ) || 0;

    // Extract user address from lebenssituation or fallback
    const userAddress = user?.lebenssituation?.wohnadresse || {};
    const userName = user?.full_name || 'Max Mustermann';
    const userStreet = userAddress.strasse || 'Musterstraße';
    const userHausnummer = userAddress.hausnummer || '1';
    const userPLZ = userAddress.plz || '12345';
    const userOrt = userAddress.ort || 'Musterstadt';

    // B5.1: Personalized salutation based on familienstand
    const getSalutation = () => {
        const familienstand = user?.lebenssituation?.familienstand;
        if (familienstand === 'verheiratet' || familienstand === 'in_partnerschaft') {
            return 'Wir, die unterzeichnenden Mieter,';
        }
        return 'Hiermit';
    };

    const handleCopyToClipboard = () => {
        const briefElement = document.getElementById('musterbrief-content');
        if (briefElement) {
            const text = briefElement.innerText;
            navigator.clipboard.writeText(text);
            toast.success('Musterbrief kopiert!');
            track('report.letter.copied', AREA.REPORT, {
                abrechnungId: abrechnung.id,
                totalSavings
            });
        }
    };

    const handlePrint = () => {
        window.print();
        track('report.letter.printed', AREA.REPORT, {
            abrechnungId: abrechnung.id
        });
    };

    return (
        <section className="my-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    📝 Ihr personalisierter Widerspruchsbrief
                </h2>
                
                <div className="flex gap-2 print:hidden">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCopyToClipboard}
                    >
                        <Copy className="w-4 h-4 mr-2" />
                        Kopieren
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handlePrint}
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Drucken
                    </Button>
                </div>
            </div>

            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg print:hidden">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>✅ Bereits personalisiert mit Ihren Daten!</strong><br />
                    Dieser Brief ist sofort versandfertig. Kopieren Sie ihn oder drucken Sie ihn aus und senden Sie ihn per <strong>Einschreiben mit Rückschein</strong> an Ihre Hausverwaltung.
                </p>
            </div>

            <div 
                id="musterbrief-content"
                className="p-8 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 font-serif text-sm leading-relaxed shadow-lg"
            >
                <div className="text-slate-800 dark:text-slate-200 space-y-4">
                    {/* Sender Address */}
                    <div>
                        <p className="font-semibold">{userName}</p>
                        <p>{userStreet} {userHausnummer}</p>
                        <p>{userPLZ} {userOrt}</p>
                    </div>
                    
                    <br />
                    
                    {/* Recipient Address */}
                    <div>
                        <p>An die</p>
                        <p className="font-semibold">{abrechnung.verwalter || 'Hausverwaltung [NAME EINTRAGEN]'}</p>
                        <p>[Adresse der Verwaltung eintragen]</p>
                    </div>
                    
                    <br />
                    <br />
                    
                    {/* Date */}
                    <p className="text-right">{userOrt}, den {today}</p>
                    
                    <br />
                    <br />
                    
                    {/* Subject */}
                    <p className="font-bold text-slate-900 dark:text-white">
                        Betreff: Widerspruch gegen die Nebenkostenabrechnung für das Jahr {abrechnung.abrechnungszeitraum}
                        <br />
                        Mietobjekt: {abrechnung.objekt_adresse || userAddress.strasse + ' ' + userAddress.hausnummer + ', ' + userAddress.plz + ' ' + userAddress.ort}
                    </p>
                    
                    <br />
                    
                    <p>Sehr geehrte Damen und Herren,</p>
                    
                    <br />
                    
                    {/* Main Body - Personalized */}
                    <p>
                        {getSalutation()} lege ich/legen wir fristgerecht <strong>Widerspruch</strong> gegen die von Ihnen erstellte Nebenkostenabrechnung für das Jahr <strong>{abrechnung.abrechnungszeitraum}</strong> ein, 
                        die mir/uns am <span className="bg-yellow-200 dark:bg-yellow-800 px-1 font-semibold">[ZUGANGSDATUM EINTRAGEN]</span> zugegangen ist.
                    </p>
                    
                    <br />
                    
                    <p>
                        Nach eingehender rechtlicher Prüfung, unterstützt durch eine KI-gestützte Analyse gemäß aktueller Rechtsprechung, 
                        habe ich/haben wir mehrere Posten identifiziert, die rechtlich nicht haltbar oder fehlerhaft sind. 
                        Dies betrifft insbesondere folgende Punkte:
                    </p>
                    
                    <br />
                    
                    {/* Error List - Personalized */}
                    <ul className="list-disc list-inside space-y-3 pl-4">
                        {abrechnung.analyse_ergebnis?.fehler?.map((fehler, index) => (
                            <li key={index} className="text-slate-700 dark:text-slate-200">
                                <strong className="text-slate-900 dark:text-white">{fehler.kategorie}:</strong> {fehler.beschreibung} 
                                <span className="font-semibold"> (Betrag: {fehler.betrag.toFixed(2)} €)</span>. 
                                <br />
                                <span className="text-sm">
                                    Rechtsgrundlage: {fehler.rechtsgrundlage}. 
                                    {fehler.schweregrad === 'hoch' && ' Dies stellt einen erheblichen Mangel dar.'}
                                </span>
                            </li>
                        ))}
                    </ul>
                    
                    <br />
                    
                    <p>
                        Die Summe der zu Unrecht geforderten Beträge beläuft sich auf mindestens{' '}
                        <strong className="text-lg font-bold bg-green-200 dark:bg-green-800 px-2 py-1 rounded">
                            {totalSavings.toFixed(2)} €
                        </strong>.
                    </p>
                    
                    <br />
                    
                    <p>
                        Ich bitte Sie um eine <strong>korrigierte Nebenkostenabrechnung</strong> unter Berücksichtigung der genannten Punkte innerhalb von <strong>14 Tagen</strong>. 
                        Weiterhin beantrage ich gemäß <strong>§ 259 BGB</strong> Einsicht in alle relevanten Belege, Rechnungen und Verträge, 
                        die dieser Abrechnung zugrunde liegen. Bitte nennen Sie mir hierfür einen Termin.
                    </p>
                    
                    <br />
                    
                    {/* Payment handling - personalized based on amount */}
                    <p>
                        {totalSavings > 500 ? (
                            <>
                                Aufgrund der Höhe der beanstandeten Summe werde ich die Nachzahlung <strong>unter Vorbehalt</strong> leisten 
                                und den beanstandeten Betrag von meiner nächsten Mietzahlung abziehen, 
                                bis eine korrekte Abrechnung vorliegt.
                            </>
                        ) : (
                            <>
                                Bis zur Klärung der Sachlage werde ich die Nachzahlung <strong>unter Vorbehalt</strong> leisten.
                            </>
                        )}
                    </p>
                    
                    <br />
                    
                    <p>
                        Sollte eine einvernehmliche Lösung nicht möglich sein, behalte ich mir vor, 
                        rechtliche Schritte einzuleiten und ggf. das Mietverhältnis wegen wiederholt fehlerhafter Abrechnungen 
                        gemäß <strong>§ 543 BGB</strong> außerordentlich zu kündigen.
                    </p>
                    
                    <br />
                    
                    <p>Ich setze Ihnen zur Bearbeitung eine Frist von <strong>14 Tagen</strong> ab Erhalt dieses Schreibens.</p>
                    
                    <br />
                    <br />
                    
                    <p>Mit freundlichen Grüßen</p>
                    
                    <br />
                    <br />
                    <br />
                    
                    {/* Signature */}
                    <div>
                        <p className="border-b-2 border-slate-400 dark:border-slate-500 w-64 mb-2">
                            _________________________
                        </p>
                        <p>({userName})</p>
                    </div>
                    
                    <br />
                    
                    {/* Attachments */}
                    <div className="pt-4 border-t border-slate-300 dark:border-slate-600">
                        <p className="text-sm font-semibold">Anlagen:</p>
                        <ul className="text-sm list-disc list-inside pl-4 space-y-1 mt-2">
                            <li>Kopie der Nebenkostenabrechnung vom {abrechnung.upload_datum ? format(new Date(abrechnung.upload_datum), 'dd.MM.yyyy') : '[DATUM]'}</li>
                            <li>Automatisierter Prüfbericht (dieses Dokument)</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm print:hidden">
                <p className="text-amber-800 dark:text-amber-200">
                    <strong>📌 Hinweis:</strong> Dieser Musterbrief wurde automatisch auf Basis Ihrer Analyse generiert. 
                    Bitte prüfen Sie alle Angaben auf Richtigkeit und tragen Sie das <strong>Zugangsdatum der Abrechnung</strong> ein, 
                    bevor Sie den Brief versenden. Bei rechtlichen Fragen konsultieren Sie bitte einen Anwalt oder Mieterverein.
                </p>
            </div>
        </section>
    );
}