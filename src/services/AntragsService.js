/**
 * ANTRAGS-SERVICE - ECHTE IMPLEMENTIERUNG
 * 
 * Funktionen:
 * 1. Anträge suchen basierend auf User-Profil
 * 2. Anträge automatisch ausfüllen
 * 3. PDF-Manipulation
 * 4. Claude AI Integration
 */

import { supabase } from '@/api/supabaseClient';

// Antrags-Datenbank (wird später in Supabase gespeichert)
const ANTRAEGE_DATABASE = {
  wohngeld: {
    id: 'wohngeld',
    name: 'Wohngeld-Antrag',
    category: 'wohnen',
    pdfUrl: '/antraege/wohngeld.pdf',
    fields: [
      { id: 'vorname', label: 'Vorname', type: 'text', required: true },
      { id: 'nachname', label: 'Nachname', type: 'text', required: true },
      { id: 'geburtsdatum', label: 'Geburtsdatum', type: 'date', required: true },
      { id: 'strasse', label: 'Straße', type: 'text', required: true },
      { id: 'hausnummer', label: 'Hausnummer', type: 'text', required: true },
      { id: 'plz', label: 'PLZ', type: 'text', required: true },
      { id: 'ort', label: 'Ort', type: 'text', required: true },
      { id: 'monatliche_miete', label: 'Monatliche Miete (kalt)', type: 'number', required: true },
      { id: 'wohnflaeche', label: 'Wohnfläche (qm)', type: 'number', required: true },
      { id: 'haushalt_groesse', label: 'Anzahl Personen im Haushalt', type: 'number', required: true },
      { id: 'monatliches_einkommen', label: 'Monatliches Nettoeinkommen', type: 'number', required: true }
    ],
    eligibilityCriteria: {
      maxEinkommen: 2000, // Beispiel
      minMiete: 300,
      maxMiete: 1500
    },
    estimatedAmount: 250,
    processingTime: '4-6 Wochen',
    authority: 'Wohngeldstelle',
    description: 'Zuschuss zur Miete für Geringverdiener'
  },
  
  kindergeld: {
    id: 'kindergeld',
    name: 'Kindergeld-Antrag',
    category: 'familie',
    pdfUrl: '/antraege/kindergeld.pdf',
    fields: [
      { id: 'vorname', label: 'Vorname', type: 'text', required: true },
      { id: 'nachname', label: 'Nachname', type: 'text', required: true },
      { id: 'geburtsdatum', label: 'Geburtsdatum', type: 'date', required: true },
      { id: 'steuer_id', label: 'Steuer-ID', type: 'text', required: true },
      { id: 'kinder_anzahl', label: 'Anzahl Kinder', type: 'number', required: true },
      { id: 'kind1_vorname', label: 'Kind 1 - Vorname', type: 'text', required: true },
      { id: 'kind1_nachname', label: 'Kind 1 - Nachname', type: 'text', required: true },
      { id: 'kind1_geburtsdatum', label: 'Kind 1 - Geburtsdatum', type: 'date', required: true }
    ],
    eligibilityCriteria: {
      hasChildren: true
    },
    estimatedAmount: 250,
    processingTime: '2-4 Wochen',
    authority: 'Familienkasse',
    description: '250€ pro Kind pro Monat'
  },
  
  buergergeld: {
    id: 'buergergeld',
    name: 'Bürgergeld-Antrag',
    category: 'soziales',
    pdfUrl: '/antraege/buergergeld.pdf',
    fields: [
      { id: 'vorname', label: 'Vorname', type: 'text', required: true },
      { id: 'nachname', label: 'Nachname', type: 'text', required: true },
      { id: 'geburtsdatum', label: 'Geburtsdatum', type: 'date', required: true },
      { id: 'beschaeftigungsstatus', label: 'Beschäftigungsstatus', type: 'select', required: true },
      { id: 'monatliches_einkommen', label: 'Monatliches Einkommen', type: 'number', required: true },
      { id: 'vermoegen', label: 'Vermögen', type: 'number', required: true }
    ],
    eligibilityCriteria: {
      maxEinkommen: 1000,
      maxVermoegen: 15000
    },
    estimatedAmount: 563,
    processingTime: '4-8 Wochen',
    authority: 'Jobcenter',
    description: 'Grundsicherung für Arbeitsuchende'
  },
  
  bafoeg: {
    id: 'bafoeg',
    name: 'BAföG-Antrag',
    category: 'bildung',
    pdfUrl: '/antraege/bafoeg.pdf',
    fields: [
      { id: 'vorname', label: 'Vorname', type: 'text', required: true },
      { id: 'nachname', label: 'Nachname', type: 'text', required: true },
      { id: 'geburtsdatum', label: 'Geburtsdatum', type: 'date', required: true },
      { id: 'hochschule', label: 'Hochschule/Universität', type: 'text', required: true },
      { id: 'studiengang', label: 'Studiengang', type: 'text', required: true },
      { id: 'semester', label: 'Fachsemester', type: 'number', required: true },
      { id: 'eltern_einkommen', label: 'Einkommen der Eltern', type: 'number', required: true }
    ],
    eligibilityCriteria: {
      isStudent: true,
      maxElternEinkommen: 60000
    },
    estimatedAmount: 934,
    processingTime: '6-8 Wochen',
    authority: 'Studierendenwerk',
    description: 'Ausbildungsförderung für Studierende'
  }
};

class AntragsService {
  /**
   * Findet passende Anträge basierend auf User-Profil
   */
  static async findEligibleAntraege(userProfile) {
    try {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('find-antraege', {
        body: { userProfile }
      });

      if (error) throw error;

      return data;
      
    } catch (error) {
      console.error('Fehler beim Suchen von Anträgen:', error);
      
      // Fallback zu lokaler Logik
      const eligibleAntraege = [];
      
      for (const [key, antrag] of Object.entries(ANTRAEGE_DATABASE)) {
        const isEligible = this.checkEligibility(userProfile, antrag);
        
        if (isEligible.eligible) {
          eligibleAntraege.push({
            ...antrag,
            eligibilityScore: isEligible.score,
            reasoning: isEligible.reasoning,
            missingData: isEligible.missingData
          });
        }
      }
      
      eligibleAntraege.sort((a, b) => b.eligibilityScore - a.eligibilityScore);
      
      return {
        success: true,
        antraege: eligibleAntraege,
        totalFound: eligibleAntraege.length
      };
    }
  }
  
  /**
   * Prüft Eligibility für einen Antrag
   */
  static checkEligibility(userProfile, antrag) {
    const criteria = antrag.eligibilityCriteria;
    let score = 0;
    let reasoning = [];
    let missingData = [];
    
    // Wohngeld-Prüfung
    if (antrag.id === 'wohngeld') {
      if (!userProfile.monatliches_nettoeinkommen) {
        missingData.push('Monatliches Einkommen');
        score = 50;
      } else if (userProfile.monatliches_nettoeinkommen <= criteria.maxEinkommen) {
        score += 40;
        reasoning.push(`Einkommen (${userProfile.monatliches_nettoeinkommen}€) liegt unter Grenze`);
      }
      
      if (!userProfile.monatliche_miete_kalt) {
        missingData.push('Monatliche Miete');
      } else if (userProfile.monatliche_miete_kalt >= criteria.minMiete && 
                 userProfile.monatliche_miete_kalt <= criteria.maxMiete) {
        score += 30;
        reasoning.push(`Miete (${userProfile.monatliche_miete_kalt}€) im förderfähigen Bereich`);
      }
      
      if (userProfile.wohnart === 'miete') {
        score += 30;
        reasoning.push('Wohnt zur Miete');
      }
    }
    
    // Kindergeld-Prüfung
    if (antrag.id === 'kindergeld') {
      if (!userProfile.kinder_anzahl) {
        missingData.push('Anzahl Kinder');
        score = 50;
      } else if (userProfile.kinder_anzahl > 0) {
        score = 100;
        reasoning.push(`${userProfile.kinder_anzahl} Kind(er) - Anspruch auf Kindergeld`);
      } else {
        score = 0;
        reasoning.push('Keine Kinder vorhanden');
      }
    }
    
    // Bürgergeld-Prüfung
    if (antrag.id === 'buergergeld') {
      if (!userProfile.monatliches_nettoeinkommen) {
        missingData.push('Monatliches Einkommen');
        score = 50;
      } else if (userProfile.monatliches_nettoeinkommen <= criteria.maxEinkommen) {
        score += 50;
        reasoning.push(`Einkommen unter Bürgergeld-Grenze`);
      }
      
      if (userProfile.beschaeftigungsstatus === 'arbeitslos') {
        score += 50;
        reasoning.push('Arbeitslos gemeldet');
      }
    }
    
    // BAföG-Prüfung
    if (antrag.id === 'bafoeg') {
      if (userProfile.beschaeftigungsstatus === 'student') {
        score += 60;
        reasoning.push('Student/in');
      } else {
        score = 0;
        reasoning.push('Kein Student');
      }
      
      if (userProfile.alter && userProfile.alter < 30) {
        score += 40;
        reasoning.push('Unter 30 Jahre alt');
      }
    }
    
    return {
      eligible: score >= 50,
      score,
      reasoning: reasoning.join(', '),
      missingData
    };
  }
  
  /**
   * Füllt Antrag automatisch mit User-Daten aus
   */
  static async autofillAntrag(antragId, userProfile) {
    try {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('autofill-antrag', {
        body: { antragId }
      });

      if (error) throw error;

      return data;
      
    } catch (error) {
      console.error('Fehler beim Ausfüllen:', error);
      
      // Fallback zu lokaler Logik
      const antrag = ANTRAEGE_DATABASE[antragId];
      if (!antrag) {
        throw new Error('Antrag nicht gefunden');
      }
      
      const filledData = {};
      const missingFields = [];
      
      const fieldMapping = {
        'vorname': userProfile.vorname,
        'nachname': userProfile.nachname,
        'geburtsdatum': userProfile.geburtsdatum,
        'strasse': userProfile.adresse?.split(' ')[0],
        'plz': userProfile.plz,
        'ort': userProfile.stadt,
        'monatliche_miete': userProfile.monatliche_miete_kalt,
        'wohnflaeche': userProfile.wohnflaeche_qm,
        'haushalt_groesse': userProfile.haushalt_groesse,
        'monatliches_einkommen': userProfile.monatliches_nettoeinkommen,
        'kinder_anzahl': userProfile.kinder_anzahl,
        'beschaeftigungsstatus': userProfile.beschaeftigungsstatus
      };
      
      for (const field of antrag.fields) {
        if (fieldMapping[field.id]) {
          filledData[field.id] = fieldMapping[field.id];
        } else if (field.required) {
          missingFields.push(field.label);
        }
      }
      
      return {
        success: true,
        antrag: {
          ...antrag,
          filledData,
          missingFields,
          completeness: Math.round((Object.keys(filledData).length / antrag.fields.length) * 100)
        }
      };
    }
  }
  
  /**
   * Generiert PDF mit ausgefüllten Daten
   */
  static async generateFilledPDF(antragId, filledData) {
    try {
      // TODO: PDF-Lib Integration
      // Für jetzt: Erstelle JSON-Download
      const dataStr = JSON.stringify(filledData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      return {
        success: true,
        downloadUrl: url,
        filename: `${antragId}_ausgefuellt.json`
      };
      
    } catch (error) {
      console.error('Fehler beim PDF-Generieren:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Speichert Antrag in Datenbank
   */
  static async saveAntrag(userId, antragId, filledData, status = 'draft') {
    try {
      const { data, error } = await supabase
        .from('antraege')
        .insert({
          user_id: userId,
          antrag_id: antragId,
          filled_data: filledData,
          status,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        antrag: data
      };
      
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Lädt gespeicherte Anträge
   */
  static async getUserAntraege(userId) {
    try {
      const { data, error } = await supabase
        .from('antraege')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return {
        success: true,
        antraege: data || []
      };
      
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      return {
        success: false,
        error: error.message,
        antraege: []
      };
    }
  }
}

export default AntragsService;
