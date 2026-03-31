import { checkMultipleEligibility } from './eligibilityEngine';
import { Foerderleistung } from '@/api/entities';

/**
 * Evaluiert alle Förderungen basierend auf den Eingaben des Nutzers.
 * Diese Funktion ist jetzt vollständig datengesteuert und nutzt die generische Prüf-Engine.
 * @param {Object} data - Haushaltsdaten vom Formular.
 * @returns {Promise<Array>} Ein Array mit sortierten Prüfungsergebnissen.
 */
export const evaluateAllFoerderungen = async (data) => {
    // 1. Konvertiere Formular-Daten in ein standardisiertes Nutzerprofil-Format
    const userProfile = {
        lebenssituation: {
            haushaltsmitglieder_anzahl: (data.anzahlErwachsene || 0) + (data.anzahlKinder || 0),
            kinder_anzahl: data.anzahlKinder || 0,
            monatliches_nettoeinkommen: data.monatlichesEinkommen || 0,
            wohnart: 'miete', // Annahme für den Rechner auf dieser Seite
            monatliche_miete_kalt: data.kaltmiete || 0,
            monatliche_nebenkosten: data.nebenkosten || 0,
            // Spezifische Daten für Heizkosten-Prüfung hinzufügen
            heizungsart: data.heizungsart,
            heizkosten_2022: {
                brennstoff: data.brennstoff,
                rechnungsbetrag: data.rechnungsbetrag2022,
                bestellmenge: data.bestellmenge
            }
        }
    };

    try {
        // 2. Lade alle aktiven Förderleistungen aus der Datenbank
        console.log('Loading Förderleistungen from database...');
        const alleFoerderleistungen = await Foerderleistung.filter({ status: 'aktiv' }, '-prioritaet');
        
        if (!alleFoerderleistungen || alleFoerderleistungen.length === 0) {
            console.warn('No active Förderleistungen found in database');
            return [];
        }
        
        console.log(`Found ${alleFoerderleistungen.length} active Förderleistungen`);
        console.log('User profile for evaluation:', userProfile);
        
        // 3. Führe die generische Prüfung für alle Leistungen durch
        const results = checkMultipleEligibility(alleFoerderleistungen, userProfile);
        
        if (!results || results.length === 0) {
            console.warn('No evaluation results returned from eligibility engine');
            return [];
        }
        
        console.log(`Generated ${results.length} evaluation results`);
        
        // 4. Validiere und bereinige Ergebnisse
        const validResults = results.filter(result => {
            return result && 
                   result.titel && 
                   result.eligibilityResult && 
                   typeof result.eligibilityResult.eligible !== 'undefined';
        });
        
        if (validResults.length !== results.length) {
            console.warn(`Filtered out ${results.length - validResults.length} invalid results`);
        }
        
        // 5. Sortiere die Ergebnisse: Zuerst nach Anspruch, dann nach Priorität
        validResults.sort((a, b) => {
            const scoreA = a.eligibilityResult.eligible ? 1 : 0;
            const scoreB = b.eligibilityResult.eligible ? 1 : 0;
            if (scoreB !== scoreA) {
                return scoreB - scoreA; // Ergebnisse mit Anspruch zuerst
            }
            return (b.prioritaet || 0) - (a.prioritaet || 0); // Dann nach höchster Priorität
        });

        console.log('Final evaluation results:', validResults.map(r => ({
            titel: r.titel,
            eligible: r.eligibilityResult.eligible,
            amount: r.eligibilityResult.amount
        })));

        // 6. Gib die sortierten, validierten Ergebnisse zurück
        return validResults;
        
    } catch (error) {
        console.error('Fehler bei der Auswertung der Förderungen:', error);
        console.error('Error stack:', error.stack);
        console.error('User profile that caused error:', userProfile);
        
        // Fallback: Zeige Fehlermeldung an statt leeres Array
        return [{
            titel: "Fehler bei der Auswertung",
            typ: "error",
            kategorie: "System",
            eligibilityResult: {
                eligible: false,
                amount: 0,
                reason: `Es ist ein technischer Fehler aufgetreten: ${error.message}. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.`
            },
            prioritaet: 0
        }];
    }
};