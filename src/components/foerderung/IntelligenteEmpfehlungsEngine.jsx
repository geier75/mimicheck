
import React from 'react';
import { User } from '@/api/entities';
import { Foerderleistung } from '@/api/entities';

/**
 * Intelligente Empfehlungs-Engine - PHASE 4 Kernkomponente
 * Analysiert Nutzerprofil und erstellt personalisierte Förderempfehlungen
 */

export class IntelligenteEmpfehlungsEngine {
    constructor() {
        this.gewichtungsMatrix = {
            // Lebenssituation -> Kategorie Relevanz (0-1)
            familienstand: {
                'ledig': { 'Bildung & Arbeit': 0.9, 'Selbstständigkeit': 0.8 },
                'verheiratet': { 'Familie & Kinder': 0.9, 'Wohnen & Miete': 0.8 },
                'geschieden': { 'Familie & Kinder': 0.8, 'Wohnen & Miete': 0.7 },
                'alleinerziehend': { 'Familie & Kinder': 1.0, 'Wohnen & Miete': 0.9 }
            },
            einkommensklasse: {
                'niedrig': { 'Wohnen & Miete': 1.0, 'Steuern & Finanzen': 0.9 },
                'mittel': { 'Familie & Kinder': 0.8, 'Bildung & Arbeit': 0.7 },
                'hoch': { 'Selbstständigkeit': 0.6, 'Rente & Alter': 0.5 }
            },
            altersgruppe: {
                'jung': { 'Bildung & Arbeit': 1.0, 'Familie & Kinder': 0.6 },
                'mittel': { 'Familie & Kinder': 0.9, 'Gesundheit & Pflege': 0.6 },
                'senior': { 'Rente & Alter': 1.0, 'Gesundheit & Pflege': 0.8 }
            }
        };
    }

    /**
     * Hauptfunktion: Generiert personalisierte Empfehlungen
     */
    async generiereEmpfehlungen(user, maxEmpfehlungen = 6) {
        try {
            // 1. Lade alle verfügbaren Förderleistungen
            const alleFoerderleistungen = await Foerderleistung.filter(
                { status: 'aktiv', automatisierbar: true }, 
                '-prioritaet'
            );

            // 2. Analysiere Nutzerprofil
            const nutzerProfil = this.analysiereNutzerProfil(user);

            // 3. Berechne Relevanz-Scores für jede Förderleistung
            const bewerteteFoerderungen = alleFoerderleistungen.map(foerderung => ({
                ...foerderung,
                relevanzScore: this.berechneRelevanzScore(foerderung, nutzerProfil),
                matchingKriterien: this.ermittleMatchingKriterien(foerderung, nutzerProfil)
            }));

            // 4. Sortiere nach Relevanz und filtere Top-Empfehlungen
            const topEmpfehlungen = bewerteteFoerderungen
                .filter(f => f.relevanzScore > 0.3) // Mindest-Relevanz
                .sort((a, b) => b.relevanzScore - a.relevanzScore)
                .slice(0, maxEmpfehlungen);

            // 5. Anreicherung mit Begründungen
            return topEmpfehlungen.map(emp => ({
                ...emp,
                empfehlungsgrund: this.generiereEmpfehlungsgrund(emp, nutzerProfil),
                anspruchswahrscheinlichkeit: this.schaetzeAnspruchswahrscheinlichkeit(emp, nutzerProfil)
            }));

        } catch (error) {
            console.error('Fehler bei Empfehlungsgenerierung:', error);
            return [];
        }
    }

    /**
     * Analysiert das Nutzerprofil und extrahiert relevante Merkmale
     */
    analysiereNutzerProfil(user) {
        const lebenssituation = user.lebenssituation || {};
        
        return {
            familienstand: this.klassifiziereFamilienstand(lebenssituation),
            einkommensklasse: this.klassifiziereEinkommen(lebenssituation.monatliches_nettoeinkommen),
            altersgruppe: this.klassifiziereAlter(user.age), // Falls verfügbar
            hatKinder: (lebenssituation.kinder_anzahl || 0) > 0,
            kinderAnzahl: lebenssituation.kinder_anzahl || 0,
            istMieter: lebenssituation.wohnart === 'miete',
            einkommen: lebenssituation.monatliches_nettoeinkommen || 0,
            miete: lebenssituation.monatliche_miete_kalt || 0,
            haushaltGroesse: lebenssituation.haushaltsmitglieder_anzahl || 1
        };
    }

    /**
     * Berechnet Relevanz-Score für eine Förderleistung basierend auf Nutzerprofil
     */
    berechneRelevanzScore(foerderleistung, nutzerProfil) {
        let score = 0;
        let faktoren = 0;

        // Basis-Score aus Priorität
        score += (foerderleistung.prioritaet || 5) / 10;
        faktoren++;

        // Kategorien-Matching
        const kategorieScore = this.getKategorieScore(foerderleistung.kategorie, nutzerProfil);
        score += kategorieScore;
        faktoren++;

        // Zielgruppen-Matching
        const zielgruppenScore = this.getZielgruppenScore(foerderleistung.zielgruppen, nutzerProfil);
        if (zielgruppenScore > 0) {
            score += zielgruppenScore;
            faktoren++;
        }

        // Spezifische Kriterien-Prüfung
        const kriterienScore = this.getKriterienScore(foerderleistung.pruefkriterien, nutzerProfil);
        score += kriterienScore;
        faktoren++;

        return faktoren > 0 ? score / faktoren : 0;
    }

    /**
     * Berechnet Kategorie-spezifischen Score
     */
    getKategorieScore(kategorie, nutzerProfil) {
        let score = 0;

        // Familienstand-basierte Gewichtung
        const famScore = this.gewichtungsMatrix.familienstand[nutzerProfil.familienstand]?.[kategorie] || 0;
        score += famScore;

        // Einkommens-basierte Gewichtung
        const einScore = this.gewichtungsMatrix.einkommensklasse[nutzerProfil.einkommensklasse]?.[kategorie] || 0;
        score += einScore;

        // Alters-basierte Gewichtung
        const alterScore = this.gewichtungsMatrix.altersgruppe[nutzerProfil.altersgruppe]?.[kategorie] || 0;
        score += alterScore;

        return score / 3; // Durchschnitt
    }

    /**
     * Prüft Zielgruppen-Übereinstimmung
     */
    getZielgruppenScore(zielgruppen, nutzerProfil) {
        if (!zielgruppen || zielgruppen.length === 0) return 0;

        let matches = 0;
        const total = zielgruppen.length;

        zielgruppen.forEach(zielgruppe => {
            const lower = zielgruppe.toLowerCase();
            
            if (lower.includes('familie') && nutzerProfil.hatKinder) matches++;
            if (lower.includes('alleinerziehend') && nutzerProfil.familienstand === 'alleinerziehend') matches++;
            if (lower.includes('geringverdiener') && nutzerProfil.einkommensklasse === 'niedrig') matches++;
            if (lower.includes('rentner') && nutzerProfil.altersgruppe === 'senior') matches++;
            if (lower.includes('student') && nutzerProfil.altersgruppe === 'jung') matches++;
            if (lower.includes('mieter') && nutzerProfil.istMieter) matches++;
        });

        return matches / total;
    }

    /**
     * Prüft spezifische Förderkriterien
     */
    getKriterienScore(pruefkriterien, nutzerProfil) {
        if (!pruefkriterien) return 0.5; // Neutral wenn keine Kriterien

        let score = 0;
        let checks = 0;

        // Einkommensgrenzen prüfen
        if (pruefkriterien.einkommensgrenzen) {
            const einkommensCheck = this.pruefeEinkommensgrenzen(pruefkriterien.einkommensgrenzen, nutzerProfil);
            score += einkommensCheck ? 1 : 0;
            checks++;
        }

        // Familienkriterien prüfen
        if (pruefkriterien.familienkriterien) {
            const familienCheck = this.pruefeFamilienkriterien(pruefkriterien.familienkriterien, nutzerProfil);
            score += familienCheck ? 1 : 0;
            checks++;
        }

        // Wohnkriterien prüfen
        if (pruefkriterien.wohnkriterien) {
            const wohnCheck = this.pruefeWohnkriterien(pruefkriterien.wohnkriterien, nutzerProfil);
            score += wohnCheck ? 1 : 0;
            checks++;
        }

        return checks > 0 ? score / checks : 0.5;
    }

    /**
     * Hilfsfunktionen für Klassifizierung
     */
    klassifiziereFamilienstand(lebenssituation) {
        const stand = lebenssituation.familienstand;
        const hatKinder = (lebenssituation.kinder_anzahl || 0) > 0;
        const haushaltsGroesse = lebenssituation.haushaltsmitglieder_anzahl || 1;
        
        if (hatKinder && haushaltsGroesse === (lebenssituation.kinder_anzahl + 1)) {
            return 'alleinerziehend';
        }
        return stand || 'ledig';
    }

    klassifiziereEinkommen(einkommen) {
        if (!einkommen) return 'niedrig';
        if (einkommen < 1500) return 'niedrig';
        if (einkommen < 3500) return 'mittel';
        return 'hoch';
    }

    klassifiziereAlter(age) {
        if (!age) return 'mittel'; // Default
        if (age < 30) return 'jung';
        if (age < 60) return 'mittel';
        return 'senior';
    }

    /**
     * Generiert menschenlesbare Empfehlungsbegründung
     */
    generiereEmpfehlungsgrund(empfehlung, nutzerProfil) {
        const gründe = [];

        if (empfehlung.matchingKriterien?.einkommenPasst) {
            gründe.push('Ihr Einkommen liegt im förderfähigen Bereich');
        }
        
        if (nutzerProfil.hatKinder && empfehlung.kategorie === 'Familie & Kinder') {
            gründe.push(`Als Familie mit ${nutzerProfil.kinderAnzahl} Kind(ern) haben Sie gute Chancen`);
        }
        
        if (nutzerProfil.einkommensklasse === 'niedrig') {
            gründe.push('Besonders geeignet für Haushalte mit niedrigem Einkommen');
        }

        if (empfehlung.prioritaet >= 8) {
            gründe.push('Eine der wichtigsten staatlichen Leistungen');
        }

        return gründe.length > 0 ? gründe.join('. ') + '.' : 'Basierend auf Ihrem Profil empfehlenswert.';
    }

    /**
     * Schätzt Anspruchswahrscheinlichkeit
     */
    schaetzeAnspruchswahrscheinlichkeit(empfehlung, nutzerProfil) {
        const score = empfehlung.relevanzScore;
        
        if (score > 0.8) return 'Sehr hoch';
        if (score > 0.6) return 'Hoch';
        if (score > 0.4) return 'Mittel';
        return 'Möglich';
    }

    // Weitere Hilfsfunktionen für Kriterien-Prüfung...
    pruefeEinkommensgrenzen(grenzen, profil) {
        // FIX: Wenn keine Einkommensgrenzen definiert sind, gilt die Bedingung als erfüllt.
        if (!grenzen) return true;

        const einkommen = profil.einkommen;
        const haushaltsGroesse = profil.haushaltGroesse;
        
        let grenze = grenzen.einzelperson_max || 0;
        if (haushaltsGroesse >= 2) grenze = grenzen.paar_max || grenze;
        if (haushaltsGroesse > 2) grenze += (haushaltsGroesse - 2) * (grenzen.pro_weiteres_kind || 0);
        
        return einkommen <= grenze;
    }

    pruefeFamilienkriterien(kriterien, profil) {
        // FIX: Wenn keine Familienkriterien definiert sind, gilt die Bedingung als erfüllt.
        if (!kriterien) return true;

        if (kriterien.min_kinder && profil.kinderAnzahl < kriterien.min_kinder) return false;
        if (kriterien.max_kinder && profil.kinderAnzahl > kriterien.max_kinder) return false;
        if (kriterien.nur_alleinerziehend && profil.familienstand !== 'alleinerziehend') return false;
        return true;
    }

    pruefeWohnkriterien(kriterien, profil) {
        // FIX: Wenn keine Wohnkriterien definiert sind, gilt die Bedingung als erfüllt.
        if (!kriterien) return true;

        if (kriterien.nur_mieter && !profil.istMieter) return false;
        if (kriterien.nur_eigentuemer && profil.istMieter) return false;
        if (kriterien.max_miete && profil.miete > kriterien.max_miete) return false;
        return true;
    }

    ermittleMatchingKriterien(foerderung, profil) {
        return {
            einkommenPasst: this.pruefeEinkommensgrenzen(foerderung.pruefkriterien?.einkommensgrenzen, profil),
            familiePasst: this.pruefeFamilienkriterien(foerderung.pruefkriterien?.familienkriterien, profil),
            wohnenPasst: this.pruefeWohnkriterien(foerderung.pruefkriterien?.wohnkriterien, profil)
        };
    }
}

// Singleton-Instanz für die App
export const empfehlungsEngine = new IntelligenteEmpfehlungsEngine();
