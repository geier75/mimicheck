/**
 * SOTA Document Scanner 2025
 * Ultra-fast local processing with progressive enhancement
 * 
 * Performance Targets:
 * - Initial Response: < 100ms
 * - Basic Extraction: < 1s
 * - Full Analysis: < 3s
 */

import * as pdfjs from 'pdfjs-dist/webpack';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

class SOTADocumentScanner {
  constructor() {
    this.cache = new Map();
    this.performanceMetrics = {
      parseStart: 0,
      parseEnd: 0,
      extractStart: 0,
      extractEnd: 0
    };
  }

  /**
   * PHASE 1: Instant Preview (< 100ms)
   * Extract basic metadata without parsing content
   */
  async instantPreview(file) {
    const start = performance.now();
    
    const preview = {
      fileName: file.name,
      fileSize: this.formatFileSize(file.size),
      fileType: file.type,
      lastModified: new Date(file.lastModified).toLocaleDateString('de-DE'),
      isValid: this.validateFile(file),
      estimatedProcessingTime: this.estimateProcessingTime(file.size)
    };

    console.log(`⚡ Instant preview in ${performance.now() - start}ms`);
    return preview;
  }

  /**
   * PHASE 2: Fast Text Extraction (< 1s)
   * Use PDF.js for quick text extraction
   */
  async fastExtraction(file) {
    const start = performance.now();
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      const textContent = [];
      const metadata = await pdf.getMetadata();
      
      // Extract first 3 pages for quick analysis
      const pagesToExtract = Math.min(3, pdf.numPages);
      
      for (let i = 1; i <= pagesToExtract; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map(item => item.str).join(' ');
        textContent.push(text);
      }

      const result = {
        pageCount: pdf.numPages,
        title: metadata.info?.Title || this.extractTitle(textContent[0]),
        author: metadata.info?.Author || 'Unbekannt',
        textPreview: textContent.join('\n').substring(0, 500),
        extractedIn: `${performance.now() - start}ms`
      };

      console.log(`⚡ Fast extraction in ${performance.now() - start}ms`);
      return result;

    } catch (error) {
      console.error('Fast extraction failed:', error);
      return null;
    }
  }

  /**
   * PHASE 3: Smart Pattern Recognition (< 2s)
   * Identify document type and extract key data
   */
  async smartRecognition(textContent) {
    const start = performance.now();
    
    const patterns = {
      nebenkostenabrechnung: {
        keywords: ['Nebenkostenabrechnung', 'Betriebskostenabrechnung', 'Heizkosten'],
        extractors: {
          zeitraum: /(?:Abrechnungszeitraum|Zeitraum|Periode)[:\s]*([0-9.]+[\s-]+[0-9.]+)/i,
          gesamtkosten: /(?:Gesamtkosten|Summe|Gesamt)[:\s]*([0-9.,]+)\s*€/i,
          nachzahlung: /(?:Nachzahlung|Nachforderung)[:\s]*([0-9.,]+)\s*€/i,
          guthaben: /(?:Guthaben|Erstattung)[:\s]*([0-9.,]+)\s*€/i,
        }
      },
      mietvertrag: {
        keywords: ['Mietvertrag', 'Mietsache', 'Vermieter', 'Mieter'],
        extractors: {
          miete: /(?:Kaltmiete|Grundmiete)[:\s]*([0-9.,]+)\s*€/i,
          nebenkosten: /(?:Nebenkosten|Betriebskosten)[:\s]*([0-9.,]+)\s*€/i,
          kaution: /(?:Kaution|Sicherheit)[:\s]*([0-9.,]+)\s*€/i,
        }
      }
    };

    let documentType = 'unbekannt';
    let extractedData = {};

    // Detect document type
    for (const [type, config] of Object.entries(patterns)) {
      const keywordMatches = config.keywords.filter(kw => 
        textContent.toLowerCase().includes(kw.toLowerCase())
      );
      
      if (keywordMatches.length > 0) {
        documentType = type;
        
        // Extract data using patterns
        for (const [field, regex] of Object.entries(config.extractors)) {
          const match = textContent.match(regex);
          if (match) {
            extractedData[field] = this.parseAmount(match[1]);
          }
        }
        break;
      }
    }

    const result = {
      documentType,
      confidence: this.calculateConfidence(extractedData),
      extractedData,
      processingTime: `${performance.now() - start}ms`
    };

    console.log(`⚡ Smart recognition in ${performance.now() - start}ms`);
    return result;
  }

  /**
   * PHASE 4: Full AI Analysis (optional, async)
   * Call Edge Function for detailed analysis if needed
   */
  async fullAIAnalysis(file, quickResults) {
    // This runs in background, doesn't block UI
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const { supabase } = await import('@/api/supabaseClient');
          const { data } = await supabase.functions.invoke('extract-document', {
            body: { file_url: URL.createObjectURL(file), quick_results: quickResults }
          });
          resolve(data);
        } catch (error) {
          console.error('AI analysis failed:', error);
          resolve(null);
        }
      }, 100); // Start after UI updates
    });
  }

  // Utility functions
  validateFile(file) {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  estimateProcessingTime(fileSize) {
    const mbSize = fileSize / (1024 * 1024);
    if (mbSize < 1) return '< 1 Sekunde';
    if (mbSize < 5) return '1-3 Sekunden';
    return '3-5 Sekunden';
  }

  extractTitle(text) {
    const lines = text.split('\n').filter(l => l.trim());
    return lines[0]?.substring(0, 50) || 'Unbekanntes Dokument';
  }

  parseAmount(str) {
    if (!str) return null;
    const cleaned = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned);
  }

  calculateConfidence(data) {
    const fields = Object.keys(data).length;
    if (fields === 0) return 0;
    if (fields < 3) return 0.3;
    if (fields < 5) return 0.6;
    return 0.9;
  }
}

// Singleton instance
export const scanner = new SOTADocumentScanner();

/**
 * Main entry point for document processing
 * Uses progressive enhancement for instant feedback
 */
export async function processDocument(file, callbacks = {}) {
  const {
    onInstantPreview = () => {},
    onFastExtraction = () => {},
    onSmartRecognition = () => {},
    onFullAnalysis = () => {},
    onError = () => {}
  } = callbacks;

  try {
    // STEP 1: Instant preview (< 100ms)
    const preview = await scanner.instantPreview(file);
    onInstantPreview(preview);

    // STEP 2: Fast extraction (< 1s)
    const extraction = await scanner.fastExtraction(file);
    if (extraction) {
      onFastExtraction(extraction);

      // STEP 3: Smart recognition (< 2s)
      const recognition = await scanner.smartRecognition(
        extraction.textPreview
      );
      onSmartRecognition(recognition);

      // STEP 4: Full AI analysis (async, background)
      scanner.fullAIAnalysis(file, { preview, extraction, recognition })
        .then(onFullAnalysis)
        .catch(console.error);
    }

  } catch (error) {
    console.error('Document processing failed:', error);
    onError(error);
  }
}

export default scanner;
