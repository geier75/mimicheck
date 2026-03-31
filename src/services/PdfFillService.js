/**
 * PDF-FILL SERVICE
 * 
 * Funktionen:
 * 1. PDF-Formularfelder automatisch ausfüllen
 * 2. Ausgefülltes PDF generieren
 * 3. PDF flattening (nicht mehr editierbar)
 * 4. Wasserzeichen hinzufügen
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import PdfParserService from './PdfParserService';

class PdfFillService {
  /**
   * Füllt PDF-Formular mit User-Daten aus
   */
  static async fillPdfForm(pdfFile, userData, options = {}) {
    try {
      // PDF laden
      const arrayBuffer = await PdfParserService.fileToArrayBuffer(pdfFile);
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const form = pdfDoc.getForm();
      
      // Mapping erstellen
      const mappingResult = await PdfParserService.createFieldMapping(pdfFile, userData);
      
      if (!mappingResult.success) {
        throw new Error(mappingResult.error);
      }
      
      const filledFields = [];
      const errors = [];
      
      // Felder ausfüllen
      for (const mapping of mappingResult.mapping) {
        try {
          const field = form.getField(mapping.pdfField);
          const success = await this.fillField(field, mapping.userValue, mapping.pdfType);
          
          if (success) {
            filledFields.push({
              field: mapping.pdfField,
              value: mapping.userValue,
              label: mapping.label
            });
          }
        } catch (error) {
          errors.push({
            field: mapping.pdfField,
            error: error.message
          });
        }
      }
      
      // Optional: Flatten (nicht mehr editierbar)
      if (options.flatten) {
        form.flatten();
      }
      
      // Optional: Wasserzeichen
      if (options.watermark) {
        await this.addWatermark(pdfDoc, options.watermark);
      }
      
      // PDF als Bytes speichern
      const pdfBytes = await pdfDoc.save();
      
      return {
        success: true,
        pdfBytes,
        filledFields,
        errors,
        totalFields: mappingResult.totalFields,
        filledCount: filledFields.length,
        errorCount: errors.length,
        unmappedFields: mappingResult.unmappedFields
      };
      
    } catch (error) {
      console.error('PDF-Fill-Fehler:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Füllt einzelnes Feld
   */
  static async fillField(field, value, fieldType) {
    try {
      if (value === null || value === undefined) {
        return false;
      }
      
      switch (fieldType) {
        case 'text':
          field.setText(String(value));
          return true;
          
        case 'checkbox':
          if (value === true || value === 'true' || value === 1) {
            field.check();
          } else {
            field.uncheck();
          }
          return true;
          
        case 'radio':
          field.select(String(value));
          return true;
          
        case 'dropdown':
          field.select(String(value));
          return true;
          
        default:
          return false;
      }
    } catch (error) {
      console.error('Feld-Fill-Fehler:', error);
      return false;
    }
  }
  
  /**
   * Fügt Wasserzeichen hinzu
   */
  static async addWatermark(pdfDoc, watermarkText) {
    try {
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // Wasserzeichen in der Mitte
        page.drawText(watermarkText, {
          x: width / 2 - 100,
          y: height / 2,
          size: 50,
          font,
          color: rgb(0.8, 0.8, 0.8),
          opacity: 0.3,
          rotate: { angle: 45, type: 'degrees' }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Wasserzeichen-Fehler:', error);
      return false;
    }
  }
  
  /**
   * Generiert Download-Link für PDF
   */
  static createDownloadLink(pdfBytes, filename = 'ausgefuellt.pdf') {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    return {
      url,
      filename,
      size: pdfBytes.length,
      sizeFormatted: this.formatBytes(pdfBytes.length)
    };
  }
  
  /**
   * Formatiert Bytes
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
  
  /**
   * Füllt PDF mit Claude AI Unterstützung
   */
  static async fillPdfWithAI(pdfFile, userData, claudeApiKey) {
    try {
      // Erst normale Befüllung
      const basicFill = await this.fillPdfForm(pdfFile, userData);
      
      if (!basicFill.success) {
        throw new Error(basicFill.error);
      }
      
      // Wenn unmapped fields existieren, Claude fragen
      if (basicFill.unmappedFields.length > 0 && claudeApiKey) {
        const aiSuggestions = await this.getAISuggestionsForFields(
          basicFill.unmappedFields,
          userData,
          claudeApiKey
        );
        
        // AI-Vorschläge anwenden
        if (aiSuggestions.success) {
          // TODO: Implementiere AI-basierte Befüllung
          console.log('AI-Vorschläge:', aiSuggestions.suggestions);
        }
      }
      
      return basicFill;
      
    } catch (error) {
      console.error('AI-Fill-Fehler:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Holt AI-Vorschläge für unmapped fields
   */
  static async getAISuggestionsForFields(unmappedFields, userData, claudeApiKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `Ich habe folgende PDF-Formularfelder, die ich nicht automatisch zuordnen konnte:

${JSON.stringify(unmappedFields, null, 2)}

User-Daten:
${JSON.stringify(userData, null, 2)}

Bitte schlage für jedes unmapped field vor, welchen Wert aus den User-Daten ich verwenden sollte.
Antworte mit JSON im Format:
{
  "suggestions": [
    {
      "pdfField": "feldname",
      "suggestedValue": "wert",
      "reasoning": "begründung",
      "confidence": 0-100
    }
  ]
}`
          }]
        })
      });
      
      if (!response.ok) {
        throw new Error('Claude API Fehler');
      }
      
      const data = await response.json();
      const content = data.content[0].text;
      const suggestions = JSON.parse(content);
      
      return {
        success: true,
        suggestions: suggestions.suggestions
      };
      
    } catch (error) {
      console.error('AI-Suggestions-Fehler:', error);
      return {
        success: false,
        error: error.message,
        suggestions: []
      };
    }
  }
  
  /**
   * Batch-Befüllung mehrerer PDFs
   */
  static async fillMultiplePdfs(pdfFiles, userData, options = {}) {
    const results = [];
    
    for (const pdfFile of pdfFiles) {
      const result = await this.fillPdfForm(pdfFile, userData, options);
      results.push({
        filename: pdfFile.name,
        ...result
      });
    }
    
    return {
      success: true,
      results,
      totalPdfs: pdfFiles.length,
      successCount: results.filter(r => r.success).length,
      errorCount: results.filter(r => !r.success).length
    };
  }
  
  /**
   * Erstellt Vorschau-Bild von PDF
   */
  static async createPdfPreview(pdfBytes) {
    try {
      // TODO: Implementiere PDF-zu-Bild Konvertierung
      // Für jetzt: Placeholder
      return {
        success: true,
        previewUrl: null,
        message: 'Preview-Generierung noch nicht implementiert'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default PdfFillService;
