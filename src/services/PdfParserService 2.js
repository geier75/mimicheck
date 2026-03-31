/**
 * PDF-PARSER SERVICE
 * 
 * Funktionen:
 * 1. PDF-Formularfelder erkennen
 * 2. Feldtypen identifizieren (Text, Checkbox, Radio, etc.)
 * 3. Feldnamen extrahieren
 * 4. Koordinaten für manuelle Befüllung
 */

import { PDFDocument } from 'pdf-lib';

class PdfParserService {
  /**
   * Analysiert PDF und extrahiert Formularfelder
   */
  static async parsePdfForm(pdfFile) {
    try {
      // PDF als ArrayBuffer laden
      const arrayBuffer = await this.fileToArrayBuffer(pdfFile);
      
      // PDF-Dokument laden
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Formular-Objekt holen
      const form = pdfDoc.getForm();
      
      // Alle Felder extrahieren
      const fields = form.getFields();
      
      const parsedFields = [];
      
      for (const field of fields) {
        const fieldData = this.extractFieldData(field);
        if (fieldData) {
          parsedFields.push(fieldData);
        }
      }
      
      return {
        success: true,
        fields: parsedFields,
        totalFields: parsedFields.length,
        pageCount: pdfDoc.getPageCount(),
        metadata: {
          title: pdfDoc.getTitle() || 'Unbekannt',
          author: pdfDoc.getAuthor() || 'Unbekannt',
          subject: pdfDoc.getSubject() || 'Unbekannt'
        }
      };
      
    } catch (error) {
      console.error('PDF-Parse-Fehler:', error);
      return {
        success: false,
        error: error.message,
        fields: []
      };
    }
  }
  
  /**
   * Extrahiert Feld-Daten
   */
  static extractFieldData(field) {
    try {
      const name = field.getName();
      const type = this.getFieldType(field);
      
      let fieldData = {
        name,
        type,
        required: false,
        value: null,
        options: []
      };
      
      // Text-Feld
      if (type === 'text') {
        fieldData.value = field.getText ? field.getText() : '';
        fieldData.maxLength = field.getMaxLength ? field.getMaxLength() : null;
      }
      
      // Checkbox
      else if (type === 'checkbox') {
        fieldData.value = field.isChecked ? field.isChecked() : false;
      }
      
      // Radio Button
      else if (type === 'radio') {
        fieldData.options = field.getOptions ? field.getOptions() : [];
        fieldData.value = field.getSelected ? field.getSelected() : null;
      }
      
      // Dropdown
      else if (type === 'dropdown') {
        fieldData.options = field.getOptions ? field.getOptions() : [];
        fieldData.value = field.getSelected ? field.getSelected() : null;
      }
      
      return fieldData;
      
    } catch (error) {
      console.error('Feld-Extraktion-Fehler:', error);
      return null;
    }
  }
  
  /**
   * Bestimmt Feldtyp
   */
  static getFieldType(field) {
    const constructor = field.constructor.name;
    
    if (constructor.includes('Text')) return 'text';
    if (constructor.includes('CheckBox')) return 'checkbox';
    if (constructor.includes('RadioGroup')) return 'radio';
    if (constructor.includes('Dropdown')) return 'dropdown';
    if (constructor.includes('Button')) return 'button';
    
    return 'unknown';
  }
  
  /**
   * Intelligente Feld-Erkennung basierend auf Namen
   */
  static identifyFieldPurpose(fieldName) {
    const name = fieldName.toLowerCase();
    
    // Persönliche Daten
    if (name.includes('vorname') || name.includes('firstname')) {
      return { category: 'personal', type: 'vorname', label: 'Vorname' };
    }
    if (name.includes('nachname') || name.includes('lastname') || name.includes('name')) {
      return { category: 'personal', type: 'nachname', label: 'Nachname' };
    }
    if (name.includes('geburt') || name.includes('birth')) {
      return { category: 'personal', type: 'geburtsdatum', label: 'Geburtsdatum' };
    }
    
    // Adresse
    if (name.includes('strasse') || name.includes('street')) {
      return { category: 'address', type: 'strasse', label: 'Straße' };
    }
    if (name.includes('hausnummer') || name.includes('number')) {
      return { category: 'address', type: 'hausnummer', label: 'Hausnummer' };
    }
    if (name.includes('plz') || name.includes('postal') || name.includes('zip')) {
      return { category: 'address', type: 'plz', label: 'PLZ' };
    }
    if (name.includes('ort') || name.includes('stadt') || name.includes('city')) {
      return { category: 'address', type: 'ort', label: 'Ort' };
    }
    
    // Finanzen
    if (name.includes('einkommen') || name.includes('income')) {
      return { category: 'financial', type: 'einkommen', label: 'Einkommen' };
    }
    if (name.includes('miete') || name.includes('rent')) {
      return { category: 'financial', type: 'miete', label: 'Miete' };
    }
    
    // Haushalt
    if (name.includes('kinder') || name.includes('children')) {
      return { category: 'household', type: 'kinder', label: 'Anzahl Kinder' };
    }
    if (name.includes('personen') || name.includes('household')) {
      return { category: 'household', type: 'haushalt', label: 'Haushaltsgröße' };
    }
    
    return { category: 'other', type: 'unknown', label: fieldName };
  }
  
  /**
   * Erstellt Mapping zwischen User-Profil und PDF-Feldern
   */
  static async createFieldMapping(pdfFile, userProfile) {
    try {
      const parseResult = await this.parsePdfForm(pdfFile);
      
      if (!parseResult.success) {
        throw new Error(parseResult.error);
      }
      
      const mapping = [];
      const unmappedFields = [];
      
      for (const field of parseResult.fields) {
        const purpose = this.identifyFieldPurpose(field.name);
        const userValue = this.getUserValueForField(purpose.type, userProfile);
        
        if (userValue !== null) {
          mapping.push({
            pdfField: field.name,
            pdfType: field.type,
            userField: purpose.type,
            userValue,
            label: purpose.label,
            category: purpose.category,
            confidence: this.calculateMappingConfidence(field.name, purpose.type)
          });
        } else {
          unmappedFields.push({
            pdfField: field.name,
            label: purpose.label,
            type: field.type,
            category: purpose.category
          });
        }
      }
      
      // Sortiere nach Confidence
      mapping.sort((a, b) => b.confidence - a.confidence);
      
      return {
        success: true,
        mapping,
        unmappedFields,
        totalFields: parseResult.fields.length,
        mappedFields: mapping.length,
        mappingRate: Math.round((mapping.length / parseResult.fields.length) * 100)
      };
      
    } catch (error) {
      console.error('Mapping-Fehler:', error);
      return {
        success: false,
        error: error.message,
        mapping: [],
        unmappedFields: []
      };
    }
  }
  
  /**
   * Holt User-Wert für Feldtyp
   */
  static getUserValueForField(fieldType, userProfile) {
    const mapping = {
      'vorname': userProfile.vorname,
      'nachname': userProfile.nachname,
      'geburtsdatum': userProfile.geburtsdatum,
      'strasse': userProfile.adresse?.split(' ')[0],
      'hausnummer': userProfile.adresse?.split(' ')[1],
      'plz': userProfile.plz,
      'ort': userProfile.stadt,
      'einkommen': userProfile.monatliches_nettoeinkommen,
      'miete': userProfile.monatliche_miete_kalt,
      'kinder': userProfile.kinder_anzahl,
      'haushalt': userProfile.haushalt_groesse
    };
    
    return mapping[fieldType] || null;
  }
  
  /**
   * Berechnet Mapping-Confidence
   */
  static calculateMappingConfidence(pdfFieldName, identifiedType) {
    const name = pdfFieldName.toLowerCase();
    const type = identifiedType.toLowerCase();
    
    // Exakte Übereinstimmung
    if (name.includes(type)) return 100;
    
    // Teilweise Übereinstimmung
    if (name.includes(type.substring(0, 4))) return 80;
    
    // Ähnliche Begriffe
    const synonyms = {
      'vorname': ['first', 'given'],
      'nachname': ['last', 'family', 'sur'],
      'geburtsdatum': ['birth', 'dob', 'geboren'],
      'strasse': ['street', 'str'],
      'plz': ['postal', 'zip', 'postcode'],
      'ort': ['city', 'town', 'stadt']
    };
    
    if (synonyms[type]) {
      for (const synonym of synonyms[type]) {
        if (name.includes(synonym)) return 70;
      }
    }
    
    return 50; // Default
  }
  
  /**
   * Konvertiert File zu ArrayBuffer
   */
  static async fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
  
  /**
   * Validiert PDF-Datei
   */
  static async validatePdf(file) {
    try {
      // Prüfe Dateityp
      if (!file.type.includes('pdf')) {
        return {
          valid: false,
          error: 'Datei ist kein PDF'
        };
      }
      
      // Prüfe Dateigröße (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return {
          valid: false,
          error: 'PDF zu groß (max 10MB)'
        };
      }
      
      // Versuche PDF zu laden
      const arrayBuffer = await this.fileToArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      return {
        valid: true,
        pageCount: pdfDoc.getPageCount(),
        hasForm: pdfDoc.getForm().getFields().length > 0
      };
      
    } catch (error) {
      return {
        valid: false,
        error: 'PDF konnte nicht geladen werden: ' + error.message
      };
    }
  }
}

export default PdfParserService;
