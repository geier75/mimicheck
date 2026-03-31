
import { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { UploadFile, InvokeLLM } from '@/api/integrations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
    FileText, 
    Download, 
    Zap, 
    CheckCircle, 
    XCircle,
    AlertTriangle, 
    Brain,
    MapPin,
    Loader2,
    Eye,
    Wand2
} from 'lucide-react';

// ZEPTO STEP 10.15 additions:
import { useUserProfile, useProfileUpdateListener } from '@/components/UserProfileContext';

// ZEPTO STEP 7.1: PDF Auto-Fill Test Cases (RED PHASE - Tests First!)
class PdfAutoFillTestCase {
    constructor(name, testFn, expectedResult = null, formType = null) {
        this.id = `pdf_autofill_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.name = name;
        this.testFn = testFn;
        this.expectedResult = expectedResult;
        this.formType = formType; // 'buergergeld', 'wohngeld', 'kindergeld', etc.
        this.status = 'pending';
        this.actualResult = null;
        this.error = null;
        this.duration = 0;
        this.timestamp = null;
    }

    async run() {
        this.status = 'running';
        this.timestamp = new Date().toISOString();
        const startTime = performance.now();
        
        try {
            this.actualResult = await this.testFn();
            this.duration = performance.now() - startTime;
            
            if (this.expectedResult !== null) {
                this.status = JSON.stringify(this.actualResult) === JSON.stringify(this.expectedResult) 
                    ? 'passed' 
                    : 'failed';
            } else {
                this.status = 'passed';
            }

            // Track PDF auto-fill test
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackPerformance(
                    'pdf_autofill_test',
                    this.duration,
                    'ms',
                    { 
                        testName: this.name, 
                        status: this.status,
                        formType: this.formType
                    }
                );
            }
        } catch (error) {
            this.error = error;
            this.status = 'failed';
            this.duration = performance.now() - startTime;
            
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackError(
                    error,
                    { 
                        source: 'pdf_autofill_test',
                        testName: this.name,
                        formType: this.formType
                    },
                    'high'
                );
            }
        }
        
        return this.status;
    }
}

// ZEPTO STEP 7.2: Intelligentes PDF-Feldmapping mit KI (REVOLUTIONARY!)
class IntelligentFieldMapper {
    constructor() {
        this.fieldMappings = new Map();
        this.confidenceThresholds = {
            high: 0.9,
            medium: 0.7,
            low: 0.5
        };
        this.learningData = {
            successfulMappings: [],
            failedMappings: [],
            userCorrections: []
        };
    }

    // ZEPTO STEP 7.3: KI-gestütztes Field Mapping
    async mapFieldsIntelligently(pdfFields, userData, formType) {
        const startTime = performance.now();
        
        try {
            // Prepare context for LLM
            const fieldNames = pdfFields.map(field => ({
                name: field.name,
                type: field.type,
                tooltip: field.tooltip || '',
                placeholder: field.placeholder || ''
            }));

            const mappingPrompt = `Du bist ein Experte für deutsche Behördenformulare. 
            
**AUFGABE:** Mappe die PDF-Formularfelder zu den Nutzerdaten PRÄZISE und KORREKT.

**FORMULAR-TYP:** ${formType}
**PDF-FELDER:** ${JSON.stringify(fieldNames)}
**NUTZERDATEN:** ${JSON.stringify(userData)}

**MAPPING-REGELN:**
1. Verwende EXAKTE Feldnamen wenn möglich
2. Berücksichtige deutsche Behörden-Terminologie
3. Achte auf Datumsformate (DD.MM.YYYY)
4. PLZ ist immer 5-stellig
5. Bei Unsicherheit: confidence < 0.7

**WICHTIG:** Jedes Mapping MUSS eine confidence (0.0-1.0) haben!`;

            const mappingResult = await InvokeLLM({
                prompt: mappingPrompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        mappings: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    pdfField: { type: "string", description: "Name des PDF-Feldes" },
                                    userDataPath: { type: "string", description: "Pfad zu den Nutzerdaten (z.B. 'vorname' oder 'lebenssituation.wohnadresse.plz')" },
                                    value: { type: "string", description: "Der zu füllende Wert" },
                                    confidence: { type: "number", minimum: 0.0, maximum: 1.0 },
                                    reasoning: { type: "string", description: "Begründung für das Mapping" }
                                },
                                required: ["pdfField", "userDataPath", "value", "confidence"]
                            }
                        },
                        overallConfidence: { type: "number", minimum: 0.0, maximum: 1.0 },
                        warningsAndMissingData: { type: "array", items: { type: "string" } }
                    },
                    required: ["mappings", "overallConfidence"]
                }
            });

            const duration = performance.now() - startTime;
            
            // Store mapping for learning
            this.learningData.successfulMappings.push({
                formType,
                fieldCount: pdfFields.length,
                mappingAccuracy: mappingResult.overallConfidence,
                duration,
                timestamp: new Date().toISOString()
            });

            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackPerformance(
                    'intelligent_field_mapping',
                    duration,
                    'ms',
                    { 
                        formType,
                        fieldCount: pdfFields.length,
                        overallConfidence: mappingResult.overallConfidence,
                        highConfidenceMappings: mappingResult.mappings.filter(m => m.confidence >= this.confidenceThresholds.high).length
                    }
                );
            }

            return {
                success: true,
                mappings: mappingResult.mappings,
                overallConfidence: mappingResult.overallConfidence,
                warnings: mappingResult.warningsAndMissingData || [],
                processingTime: duration
            };

        } catch (error) {
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackError(
                    error,
                    { 
                        source: 'intelligent_field_mapping',
                        formType,
                        fieldCount: pdfFields?.length || 0
                    },
                    'high'
                );
            }
            
            return {
                success: false,
                error: error.message,
                mappings: [],
                overallConfidence: 0
            };
        }
    }

    // ZEPTO STEP 7.4: Lern-Algorithmus für besseres Mapping
    async learnFromUserCorrection(originalMapping, correctedMapping, formType) {
        this.learningData.userCorrections.push({
            formType,
            original: originalMapping,
            corrected: correctedMapping,
            timestamp: new Date().toISOString()
        });

        // Nach 10 Korrekturen: Pattern-Analyse
        if (this.learningData.userCorrections.length % 10 === 0) {
            await this.analyzeAndUpdatePatterns();
        }
    }

    async analyzeAndUpdatePatterns() {
        const corrections = this.learningData.userCorrections.slice(-50); // Letzte 50 Korrekturen
        
        const patternAnalysisPrompt = `Analysiere diese Nutzer-Korrekturen um Mapping-Pattern zu verbessern:

**KORREKTUREN:** ${JSON.stringify(corrections)}

Finde wiederkehrende Muster und erstelle verbesserte Mapping-Regeln.`;

        try {
            const patterns = await InvokeLLM({
                prompt: patternAnalysisPrompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        improvedRules: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    pattern: { type: "string" },
                                    rule: { type: "string" },
                                    confidence: { type: "number" }
                                }
                            }
                        }
                    }
                }
            });

            // Update internal mapping rules
            patterns.improvedRules.forEach(rule => {
                this.fieldMappings.set(rule.pattern, rule);
            });

            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackUserInteraction(
                    'field_mapping_patterns_learned',
                    'IntelligentFieldMapper',
                    { 
                        newRules: patterns.improvedRules.length,
                        totalCorrections: corrections.length
                    }
                );
            }

        } catch (error) {
            console.warn('Pattern learning failed:', error);
        }
    }
}

// ZEPTO STEP 7.5: Premium PDF Auto-Fill Engine (GREEN PHASE - Implementation)
class PremiumPdfAutoFillEngine {
    constructor() {
        this.fieldMapper = new IntelligentFieldMapper();
        this.supportedFormTypes = new Map([
            ['buergergeld', {
                title: 'Antrag auf Bürgergeld',
                fields: [
                    { name: 'vorname', type: 'text', required: true },
                    { name: 'nachname', type: 'text', required: true },
                    { name: 'geburtsdatum', type: 'date', required: true, format: 'DD.MM.YYYY' },
                    { name: 'strasse_hausnummer', type: 'text', required: true },
                    { name: 'postleitzahl', type: 'text', required: true, length: 5 },
                    { name: 'ort', type: 'text', required: true },
                    { name: 'telefon', type: 'text', required: false },
                    { name: 'email', type: 'email', required: false },
                    { name: 'familienstand', type: 'select', required: true, options: ['ledig', 'verheiratet', 'verwitwet', 'geschieden'] },
                    { name: 'staatsangehoerigkeit', type: 'text', required: true },
                    { name: 'iban', type: 'text', required: true },
                    { name: 'bic', type: 'text', required: false },
                    { name: 'monatliches_einkommen', type: 'number', required: true },
                    { name: 'miete_kalt', type: 'number', required: true },
                    { name: 'miete_warm', type: 'number', required: true },
                    { name: 'anzahl_kinder', type: 'number', required: false },
                    { name: 'datum_antragstellung', type: 'date', required: true, format: 'DD.MM.YYYY' }
                ]
            }],
            ['wohngeld', {
                title: 'Antrag auf Wohngeld',
                fields: [
                    { name: 'vorname', type: 'text', required: true },
                    { name: 'nachname', type: 'text', required: true },
                    { name: 'geburtsdatum', type: 'date', required: true, format: 'DD.MM.YYYY' },
                    { name: 'postleitzahl', type: 'text', required: true, length: 5 },
                    { name: 'ort', type: 'text', required: true },
                    { name: 'strasse_hausnummer', type: 'text', required: true },
                    { name: 'wohnflaeche_qm', type: 'number', required: true },
                    { name: 'anzahl_zimmer', type: 'number', required: true },
                    { name: 'miete_kalt_euro', type: 'number', required: true },
                    { name: 'nebenkosten_euro', type: 'number', required: true },
                    { name: 'heizkosten_euro', type: 'number', required: true },
                    { name: 'haushaltsgroesse', type: 'number', required: true },
                    { name: 'gesamteinkommen_monatlich', type: 'number', required: true },
                    { name: 'mietertyp', type: 'select', required: true, options: ['hauptmieter', 'untermieter'] },
                    { name: 'einzugsdatum', type: 'date', required: true, format: 'DD.MM.YYYY' }
                ]
            }],
            ['kindergeld', {
                title: 'Antrag auf Kindergeld',
                fields: [
                    { name: 'vorname_antragsteller', type: 'text', required: true },
                    { name: 'nachname_antragsteller', type: 'text', required: true },
                    { name: 'geburtsdatum_antragsteller', type: 'date', required: true, format: 'DD.MM.YYYY' },
                    { name: 'steuer_id_antragsteller', type: 'text', required: true },
                    { name: 'kindergeldnummer', type: 'text', required: false },
                    { name: 'anzahl_kinder', type: 'number', required: true },
                    { name: 'vorname_kind_1', type: 'text', required: true },
                    { name: 'nachname_kind_1', type: 'text', required: true },
                    { name: 'geburtsdatum_kind_1', type: 'date', required: true, format: 'DD.MM.YYYY' },
                    { name: 'steuer_id_kind_1', type: 'text', required: false },
                    { name: 'iban_antragsteller', type: 'text', required: true },
                    { name: 'bic_antragsteller', type: 'text', required: false },
                    { name: 'familienstand_antragsteller', type: 'select', required: true, options: ['ledig', 'verheiratet', 'verwitwet', 'geschieden'] }
                ]
            }]
        ]);
        this.processingHistory = [];
        this.qualityMetrics = {
            totalFormsProcessed: 0,
            successfulAutoFills: 0,
            averageConfidence: 0,
            processingTimeAvg: 0
        };
    }

    // ZEPTO STEP 7.6: Auto-Fill PDF mit höchster Präzision
    async autoFillPdf(formType, userData, options = {}) {
        const startTime = performance.now();
        const processingId = `autofill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackUserInteraction(
                    'pdf_autofill_started',
                    'PremiumPdfAutoFillEngine',
                    { 
                        formType,
                        processingId,
                        hasUserData: !!userData,
                        userDataFields: userData ? Object.keys(userData).length : 0
                    }
                );
            }

            // Get form definition
            const formDefinition = this.supportedFormTypes.get(formType);
            if (!formDefinition) {
                throw new Error(`Formular-Typ "${formType}" wird nicht unterstützt`);
            }

            // Validate required user data
            const validation = await this.validateUserDataCompleteness(userData, formDefinition);
            if (!validation.isComplete) {
                return {
                    success: false,
                    processingId,
                    error: 'Unvollständige Nutzerdaten',
                    missingFields: validation.missingFields,
                    completionRate: validation.completionRate
                };
            }

            // Intelligent field mapping
            const mappingResult = await this.fieldMapper.mapFieldsIntelligently(
                formDefinition.fields, 
                userData, 
                formType
            );

            if (!mappingResult.success) {
                throw new Error(`Field-Mapping fehlgeschlagen: ${mappingResult.error}`);
            }

            // Generate filled PDF data structure
            const filledPdfData = await this.generateFilledPdfData(
                mappingResult.mappings,
                formDefinition,
                userData
            );

            // Quality assurance check
            const qualityCheck = await this.performQualityAssurance(
                filledPdfData,
                mappingResult,
                formDefinition
            );

            const processingTime = performance.now() - startTime;

            // Update metrics
            this.qualityMetrics.totalFormsProcessed++;
            if (qualityCheck.score >= 0.8) {
                this.qualityMetrics.successfulAutoFills++;
            }
            this.qualityMetrics.averageConfidence = 
                (this.qualityMetrics.averageConfidence + mappingResult.overallConfidence) / 2;
            this.qualityMetrics.processingTimeAvg = 
                (this.qualityMetrics.processingTimeAvg + processingTime) / 2;

            // Store processing history
            const historyEntry = {
                processingId,
                formType,
                timestamp: new Date().toISOString(),
                processingTime,
                mappingConfidence: mappingResult.overallConfidence,
                qualityScore: qualityCheck.score,
                fieldsCompleted: filledPdfData.completedFields,
                totalFields: formDefinition.fields.length,
                success: true
            };
            this.processingHistory.push(historyEntry);

            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackPerformance(
                    'pdf_autofill_completed',
                    processingTime,
                    'ms',
                    { 
                        formType,
                        processingId,
                        mappingConfidence: mappingResult.overallConfidence,
                        qualityScore: qualityCheck.score,
                        fieldsCompleted: filledPdfData.completedFields,
                        totalFields: formDefinition.fields.length
                    }
                );
            }

            return {
                success: true,
                processingId,
                formType,
                filledPdfData,
                qualityAssurance: qualityCheck,
                mappingConfidence: mappingResult.overallConfidence,
                processingTime,
                warnings: mappingResult.warnings || [],
                completionRate: (filledPdfData.completedFields / formDefinition.fields.length) * 100,
                downloadUrl: `https://generated-pdfs.staatshilfen.ai/${processingId}.pdf` // Simulated
            };

        } catch (error) {
            const processingTime = performance.now() - startTime;
            
            // Store failed processing
            this.processingHistory.push({
                processingId,
                formType,
                timestamp: new Date().toISOString(),
                processingTime,
                success: false,
                error: error.message
            });

            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackError(
                    error,
                    { 
                        source: 'pdf_autofill',
                        formType,
                        processingId,
                        processingTime
                    },
                    'high'
                );
            }

            return {
                success: false,
                processingId,
                formType,
                error: error.message,
                processingTime
            };
        }
    }

    // ZEPTO STEP 7.7: User Data Completeness Validation
    async validateUserDataCompleteness(userData, formDefinition) {
        const requiredFields = formDefinition.fields.filter(field => field.required);
        const missingFields = [];
        let completedFields = 0;

        for (const field of requiredFields) {
            const value = this.extractUserDataValue(userData, field.name);
            if (!value || value === '') {
                missingFields.push({
                    fieldName: field.name,
                    fieldType: field.type,
                    reason: 'Pflichtfeld nicht ausgefüllt'
                });
            } else {
                completedFields++;
            }
        }

        const completionRate = (completedFields / requiredFields.length) * 100;

        return {
            isComplete: missingFields.length === 0,
            completionRate,
            missingFields,
            completedRequiredFields: completedFields,
            totalRequiredFields: requiredFields.length
        };
    }

    // ZEPTO STEP 7.8: Generate Filled PDF Data Structure
    async generateFilledPdfData(mappings, formDefinition, userData) {
        const filledFields = {};
        let completedFields = 0;

        for (const mapping of mappings) {
            try {
                let value = mapping.value;

                // Find field definition for validation
                const fieldDef = formDefinition.fields.find(f => f.name === mapping.pdfField);
                if (fieldDef) {
                    // Format value according to field type
                    value = this.formatValueForField(value, fieldDef);
                    
                    // Validate value
                    if (this.validateFieldValue(value, fieldDef)) {
                        filledFields[mapping.pdfField] = {
                            value,
                            confidence: mapping.confidence,
                            userDataPath: mapping.userDataPath,
                            reasoning: mapping.reasoning,
                            fieldType: fieldDef.type,
                            formatted: true
                        };
                        completedFields++;
                    } else {
                        filledFields[mapping.pdfField] = {
                            value: '',
                            confidence: 0,
                            error: `Validation failed for value: ${value}`,
                            fieldType: fieldDef.type
                        };
                    }
                } else {
                    filledFields[mapping.pdfField] = {
                        value,
                        confidence: mapping.confidence,
                        warning: 'Field definition not found'
                    };
                }
            } catch (error) {
                filledFields[mapping.pdfField] = {
                    value: '',
                    confidence: 0,
                    error: error.message
                };
            }
        }

        return {
            fields: filledFields,
            completedFields,
            totalFields: formDefinition.fields.length,
            completionRate: (completedFields / formDefinition.fields.length) * 100,
            generatedAt: new Date().toISOString()
        };
    }

    // ZEPTO STEP 7.9: Format values according to field types
    formatValueForField(value, fieldDefinition) {
        switch (fieldDefinition.type) {
            case 'date':
                if (fieldDefinition.format === 'DD.MM.YYYY') {
                    const date = new Date(value);
                    if (isNaN(date.getTime())) return value; // Keep original if invalid
                    return date.toLocaleDateString('de-DE');
                }
                return value;
            
            case 'number':
                const num = parseFloat(value);
                return isNaN(num) ? '' : num.toString();
            
            case 'text':
                if (fieldDefinition.length) {
                    return value.toString().substring(0, fieldDefinition.length);
                }
                return value.toString();
            
            case 'email':
                return value.toString().toLowerCase();
            
            case 'select':
                const options = fieldDefinition.options || [];
                const lowerValue = value.toString().toLowerCase();
                const match = options.find(opt => opt.toLowerCase() === lowerValue);
                return match || value;
            
            default:
                return value.toString();
        }
    }

    // ZEPTO STEP 7.10: Validate field values
    validateFieldValue(value, fieldDefinition) {
        if (fieldDefinition.required && (!value || value === '')) {
            return false;
        }

        switch (fieldDefinition.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return !value || emailRegex.test(value);
            
            case 'text':
                if (fieldDefinition.length && value.length > fieldDefinition.length) {
                    return false;
                }
                if (fieldDefinition.name === 'postleitzahl' && value.length !== 5) {
                    return false;
                }
                return true;
            
            case 'number':
                return !isNaN(parseFloat(value));
            
            case 'date':
                const date = new Date(value);
                return !isNaN(date.getTime());
            
            case 'select':
                if (!fieldDefinition.options) return true;
                return fieldDefinition.options.includes(value);
            
            default:
                return true;
        }
    }

    // ZEPTO STEP 7.11: Quality Assurance Check
    async performQualityAssurance(filledPdfData, mappingResult, formDefinition) {
        const totalFields = formDefinition.fields.length;
        const completedFields = filledPdfData.completedFields;
        const requiredFields = formDefinition.fields.filter(f => f.required).length;
        const completedRequiredFields = Object.values(filledPdfData.fields)
            .filter(field => field.value && field.value !== '').length;

        // Calculate quality score
        const completionScore = completedFields / totalFields;
        const requiredCompletionScore = requiredFields > 0 ? completedRequiredFields / requiredFields : 1; // Avoid division by zero
        const confidenceScore = mappingResult.overallConfidence;
        const qualityScore = (completionScore * 0.3 + requiredCompletionScore * 0.5 + confidenceScore * 0.2);

        // Generate quality report
        const issues = [];
        if (requiredCompletionScore < 1.0) {
            issues.push(`${requiredFields - completedRequiredFields} Pflichtfelder nicht ausgefüllt`);
        }
        if (confidenceScore < 0.8) {
            issues.push('Niedrige Mapping-Konfidenz - Überprüfung empfohlen');
        }

        const recommendations = [];
        if (qualityScore < 0.9) {
            recommendations.push('Manuelle Überprüfung vor Einreichung empfohlen');
        }
        if (completionScore < 0.8) {
            recommendations.push('Nutzerprofil vervollständigen für bessere Ergebnisse');
        }

        return {
            score: qualityScore,
            grade: qualityScore >= 0.95 ? 'EXCELLENT' : 
                   qualityScore >= 0.85 ? 'GOOD' : 
                   qualityScore >= 0.70 ? 'ACCEPTABLE' : 'NEEDS_IMPROVEMENT',
            completionRate: (completedFields / totalFields) * 100,
            requiredFieldsComplete: completedRequiredFields === requiredFields,
            issues,
            recommendations,
            readyForSubmission: qualityScore >= 0.8 && completedRequiredFields === requiredFields
        };
    }

    // ZEPTO STEP 7.12: Extract user data value with path support
    extractUserDataValue(userData, fieldPath) {
        // Support nested paths like 'lebenssituation.wohnadresse.plz'
        const keys = fieldPath.split('.');
        let value = userData;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return null;
            }
        }
        
        return value;
    }

    // ZEPTO STEP 7.13: Get processing history and metrics
    getProcessingMetrics() {
        return {
            ...this.qualityMetrics,
            successRate: this.qualityMetrics.totalFormsProcessed > 0 ? 
                (this.qualityMetrics.successfulAutoFills / this.qualityMetrics.totalFormsProcessed) * 100 : 0,
            recentProcessing: this.processingHistory.slice(-10)
        };
    }
}

// ZEPTO STEP 7.14: Create PDF Auto-Fill Tests (RED PHASE)
const createPdfAutoFillTests = () => [
    new PdfAutoFillTestCase(
        'Bürgergeld-Formular - Vollständige Daten',
        async () => {
            const autoFillEngine = new PremiumPdfAutoFillEngine();
            const testUserData = {
                vorname: 'Max',
                nachname: 'Mustermann',
                geburtsdatum: '1985-03-15',
                lebenssituation: {
                    wohnadresse: {
                        strasse: 'Musterstraße',
                        hausnummer: '123',
                        plz: '10115',
                        ort: 'Berlin'
                    },
                    monatliches_nettoeinkommen: 1800,
                    miete_kalt: 800,
                    familienstand: 'ledig'
                },
                email: 'max.mustermann@example.com',
                telefon: '030-12345678',
                staatsangehoerigkeit: 'deutsch',
                bankverbindung: {
                    iban: 'DE89370400440532013000',
                    bic: 'COBADEFFXXX'
                }
            };
            
            const result = await autoFillEngine.autoFillPdf('buergergeld', testUserData);
            
            return {
                success: result.success,
                completionRate: result.completionRate,
                qualityGrade: result.qualityAssurance?.grade,
                readyForSubmission: result.qualityAssurance?.readyForSubmission,
                processingTime: result.processingTime
            };
        },
        { 
            success: true, 
            completionRate: 100, 
            qualityGrade: 'EXCELLENT',
            readyForSubmission: true
        },
        'buergergeld'
    ),

    new PdfAutoFillTestCase(
        'Wohngeld-Formular - Vollständige Daten',
        async () => {
            const autoFillEngine = new PremiumPdfAutoFillEngine();
            const testUserData = {
                vorname: 'Anna',
                nachname: 'Schmidt',
                geburtsdatum: '1990-07-22',
                lebenssituation: {
                    wohnadresse: {
                        strasse: 'Beispielweg',
                        hausnummer: '45',
                        plz: '20095',
                        ort: 'Hamburg',
                        wohnflaeche_qm: 65,
                        anzahl_zimmer: 3,
                        einzugsdatum: '2020-01-01'
                    },
                    monatliches_nettoeinkommen: 2200,
                    miete_kalt: 950,
                    nebenkosten: 180,
                    heizkosten: 120,
                    haushaltsmitglieder_anzahl: 2
                }
            };
            
            const result = await autoFillEngine.autoFillPdf('wohngeld', testUserData);
            
            return {
                success: result.success,
                completionRate: result.completionRate,
                qualityGrade: result.qualityAssurance?.grade,
                readyForSubmission: result.qualityAssurance?.readyForSubmission
            };
        },
        { 
            success: true, 
            completionRate: 100, 
            qualityGrade: 'EXCELLENT',
            readyForSubmission: true
        },
        'wohngeld'
    ),

    new PdfAutoFillTestCase(
        'Intelligentes Field-Mapping - Konfidenz-Test',
        async () => {
            const fieldMapper = new IntelligentFieldMapper();
            const mockPdfFields = [
                { name: 'vorname_antragsteller', type: 'text', tooltip: 'Ihr Vorname' },
                { name: 'plz_wohnort', type: 'text', tooltip: 'Postleitzahl des Wohnorts' },
                { name: 'monatl_einkommen_netto', type: 'number', tooltip: 'Monatliches Nettoeinkommen in Euro' }
            ];
            
            const testUserData = {
                vorname: 'Test',
                nachname: 'User',
                lebenssituation: {
                    wohnadresse: { plz: '12345' },
                    monatliches_nettoeinkommen: 2500
                }
            };
            
            const result = await fieldMapper.mapFieldsIntelligently(mockPdfFields, testUserData, 'test');
            
            return {
                success: result.success,
                overallConfidence: result.overallConfidence,
                mappingsCount: result.mappings.length,
                highConfidenceMappings: result.mappings.filter(m => m.confidence >= 0.8).length
            };
        },
        { 
            success: true, 
            overallConfidence: 0.9,
            mappingsCount: 3,
            highConfidenceMappings: 3
        },
        'test'
    ),

    new PdfAutoFillTestCase(
        'Unvollständige Daten - Qualitäts-Check',
        async () => {
            const autoFillEngine = new PremiumPdfAutoFillEngine();
            const incompleteUserData = {
                vorname: 'Incomplete',
                nachname: 'User',
                // Missing required fields intentionally
            };
            
            const result = await autoFillEngine.autoFillPdf('buergergeld', incompleteUserData);
            
            return {
                success: result.success,
                hasError: !!result.error,
                missingFieldsDetected: result.missingFields?.length > 0,
                completionRate: result.completionRate || 0
            };
        },
        { 
            success: false, 
            hasError: true,
            missingFieldsDetected: true,
            completionRate: 0
        },
        'buergergeld'
    ),

    new PdfAutoFillTestCase(
        'Datenvalidierung - Feldtyp-Prüfung',
        async () => {
            const autoFillEngine = new PremiumPdfAutoFillEngine();
            
            // Test individual validation methods
            const emailValid = autoFillEngine.validateFieldValue('test@example.com', { type: 'email' });
            const emailInvalid = autoFillEngine.validateFieldValue('invalid-email', { type: 'email' });
            const plzValid = autoFillEngine.validateFieldValue('12345', { type: 'text', name: 'postleitzahl', length: 5 });
            const plzInvalid = autoFillEngine.validateFieldValue('123', { type: 'text', name: 'postleitzahl', length: 5 });
            const numberValid = autoFillEngine.validateFieldValue('1234.56', { type: 'number' });
            const numberInvalid = autoFillEngine.validateFieldValue('not-a-number', { type: 'number' });
            
            return {
                emailValidation: emailValid && !emailInvalid,
                plzValidation: plzValid && !plzInvalid,
                numberValidation: numberValid && !numberInvalid,
                allValidationsCorrect: emailValid && !emailInvalid && plzValid && !plzInvalid && numberValid && !numberInvalid
            };
        },
        { 
            emailValidation: true,
            plzValidation: true,
            numberValidation: true,
            allValidationsCorrect: true
        },
        'validation'
    )
];

// ZEPTO STEP 7.15: Main Auto PDF Generator Component
export default function AutoPdfGenerator({ applicationType }) {
    // ZEPTO STEP 10.15: Use global user profile with auto-sync
    const { user, profileVersion } = useUserProfile();
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const [testResults, setTestResults] = useState({});
    const [autoFillEngine] = useState(() => new PremiumPdfAutoFillEngine());
    const [processingHistory, setProcessingHistory] = useState([]);
    const [selectedFormType, setSelectedFormType] = useState('buergergeld');

    const [formData, setFormData] = useState({});
    const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);
    const [error, setError] = useState(null);

    // ZEPTO STEP 10.16: Auto-refresh form data when profile updates
    useProfileUpdateListener(async ({ eventType, data }) => {
        if (eventType === 'profile_updated' || eventType === 'profile_refreshed') {
            console.log('📄 AutoPdfGenerator: Profile updated, refreshing form data...');
            
            // Update form data with new user profile
            if (data.user) {
                updateFormDataFromUser(data.user);
            }

            if (window.MiMiCheckObservability) {
                window.MiMiCheckObservability.trackUserInteraction(
                    'pdf_form_auto_refresh',
                    'AutoPdfGenerator',
                    { eventType, applicationType }
                );
            }
        }
    }, [applicationType]);

    const updateFormDataFromUser = (currentUser) => {
        setFormData({
            vorname: currentUser.vorname || '',
            nachname: currentUser.nachname || '',
            geburtsdatum: currentUser.geburtsdatum || '',
            strasse: currentUser.lebenssituation?.wohnadresse?.strasse || '',
            hausnummer: currentUser.lebenssituation?.wohnadresse?.hausnummer || '',
            plz: currentUser.lebenssituation?.wohnadresse?.plz || '',
            ort: currentUser.lebenssituation?.wohnadresse?.ort || '',
            familienstand: currentUser.lebenssituation?.familienstand || '',
            beschaeftigungsstatus: currentUser.lebenssituation?.beschaeftigungsstatus || '',
            monatliches_nettoeinkommen: currentUser.lebenssituation?.monatliches_nettoeinkommen || '',
            kinder_anzahl: currentUser.lebenssituation?.kinder_anzahl || 0,
            bankverbindung_iban: currentUser.lebenssituation?.bankverbindung?.iban || ''
        });
    };

    useEffect(() => {
        if (user) {
            updateFormDataFromUser(user);
        }
        
        if (window.MiMiCheckObservability) {
            window.MiMiCheckObservability.trackUserInteraction(
                'auto_pdf_generator_loaded',
                'AutoPdfGenerator',
                { timestamp: new Date().toISOString(), applicationType }
            );
        }
    }, [user, profileVersion, applicationType]);

    const runAllTests = async () => {
        setIsProcessing(true);
        setError(null);
        setProgress(0);
        setCurrentStep('Teste PDF Auto-Fill Engine...');
        
        const allTests = createPdfAutoFillTests();
        const results = {};
        let completedTests = 0;
        
        for (const test of allTests) {
            setCurrentStep(`Ausführung: ${test.name}`);
            await test.run();
            results[test.id] = test;
            completedTests++;
            setProgress((completedTests / allTests.length) * 100);
        }
        
        setTestResults(results);
        setCurrentStep('Tests abgeschlossen');
        setIsProcessing(false);
        
        // Calculate overall compliance
        const passedTests = Object.values(results).filter(test => test.status === 'passed').length;
        const overallCompliance = (passedTests / allTests.length) * 100;
        
        if (window.MiMiCheckObservability) {
            window.MiMiCheckObservability.trackUserInteraction(
                'pdf_autofill_tests_completed',
                'AutoPdfGenerator',
                { 
                    totalTests: allTests.length,
                    passedTests,
                    overallCompliance,
                    applicationType
                }
            );
        }
    };

    const generatePdf = async (formType) => {
        if (!user) {
            setError('Bitte loggen Sie sich zuerst ein, um ein Formular zu generieren.');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setGeneratedPdfUrl(null);
        setCurrentStep(`Generiere ${formType} Formular...`);
        setProgress(0);

        try {
            setProgress(25);
            setCurrentStep('Analysiere Nutzerdaten...');
            
            const result = await autoFillEngine.autoFillPdf(formType, user);
            
            setProgress(75);
            setCurrentStep('Qualitätsprüfung läuft...');
            
            // Update processing history
            const history = autoFillEngine.getProcessingMetrics().recentProcessing;
            setProcessingHistory(history);
            
            setProgress(100);
            
            if (result.success) {
                setCurrentStep(`✅ ${formType} Formular erfolgreich generiert!`);
                setGeneratedPdfUrl(result.downloadUrl);
                
                // Simulate download (in real app: trigger actual PDF download)
                setTimeout(() => {
                    alert(`PDF generiert! Qualität: ${result.qualityAssurance.grade}\nVervollständigung: ${result.completionRate.toFixed(1)}%\n\nIn der echten App würde jetzt der Download starten.`);
                    setIsProcessing(false);
                }, 1500);
            } else {
                setCurrentStep(`❌ Fehler: ${result.error}`);
                setError(result.error);
                setTimeout(() => setIsProcessing(false), 2000);
            }
        } catch (err) {
            setCurrentStep(`❌ Unerwarteter Fehler: ${err.message}`);
            setError(err.message);
            setTimeout(() => setIsProcessing(false), 2000);
        }
    };

    const testResultsArray = Object.values(testResults);
    const passedTests = testResultsArray.filter(test => test.status === 'passed').length;
    const failedTests = testResultsArray.filter(test => test.status === 'failed').length;
    const overallCompliance = testResultsArray.length > 0 ? (passedTests / testResultsArray.length) * 100 : 0;
    const metrics = autoFillEngine.getProcessingMetrics();

    return (
        <div className="space-y-8">
            {/* Header */}
            <Card className="border-none shadow-2xl bg-gradient-to-br from-purple-50/80 to-blue-50/80 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
                            <Wand2 className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
                        Premium PDF Auto-Fill Engine
                    </CardTitle>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        KI-gestützte Formular-Ausfüllung mit intelligenter Feldmappierung und höchster Präzision
                    </p>
                </CardHeader>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Brain className="w-7 h-7" />
                        PDF Generierung
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <Button 
                            onClick={() => generatePdf('buergergeld')}
                            disabled={isProcessing}
                            className="h-20 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex flex-col items-center justify-center gap-2"
                        >
                            <FileText className="w-6 h-6" />
                            <span className="font-semibold">Bürgergeld-Antrag</span>
                        </Button>
                        
                        <Button 
                            onClick={() => generatePdf('wohngeld')}
                            disabled={isProcessing}
                            className="h-20 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 flex flex-col items-center justify-center gap-2"
                        >
                            <FileText className="w-6 h-6" />
                            <span className="font-semibold">Wohngeld-Antrag</span>
                        </Button>
                        
                        <Button 
                            onClick={() => generatePdf('kindergeld')}
                            disabled={isProcessing}
                            className="h-20 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 flex flex-col items-center justify-center gap-2"
                        >
                            <FileText className="w-6 h-6" />
                            <span className="font-semibold">Kindergeld-Antrag</span>
                        </Button>
                    </div>

                    {isProcessing && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-3 mb-3">
                                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                <span className="font-semibold text-purple-800 dark:text-purple-200">{currentStep}</span>
                            </div>
                            <Progress value={progress} className="h-3" />
                            <p className="text-center mt-2 text-purple-700 dark:text-purple-300 text-sm">
                                {progress.toFixed(0)}% abgeschlossen
                            </p>
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            <p className="font-medium">Fehler: {error}</p>
                        </div>
                    )}
                    {generatedPdfUrl && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            <p className="font-medium">PDF erfolgreich generiert!</p>
                            <a href={generatedPdfUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-blue-600 hover:underline">
                                <Button variant="outline" size="sm">
                                    PDF Herunterladen <Download className="w-4 h-4 ml-2" />
                                </Button>
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Processing Metrics */}
            {metrics.totalFormsProcessed > 0 && (
                <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <Eye className="w-6 h-6" />
                            Processing Metrics & Qualität
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                            <div className="text-3xl font-bold text-green-600 mb-1">
                                {metrics.totalFormsProcessed}
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-300">Formulare verarbeitet</div>
                        </div>
                        
                        <div className="text-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                            <div className="text-3xl font-bold text-blue-600 mb-1">
                                {metrics.successRate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">Erfolgsrate</div>
                        </div>
                        
                        <div className="text-center p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                            <div className="text-3xl font-bold text-purple-600 mb-1">
                                {(metrics.averageConfidence * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-300">Ø Konfidenz</div>
                        </div>
                        
                        <div className="text-center p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                            <div className="text-3xl font-bold text-orange-600 mb-1">
                                {metrics.processingTimeAvg.toFixed(0)}ms
                            </div>
                            <div className="text-sm text-orange-700 dark:text-orange-300">Ø Verarbeitungszeit</div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Test Infrastructure */}
            <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <CheckCircle className="w-6 h-6" />
                        Test Infrastructure & Quality Assurance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-6">
                        <Button 
                            onClick={runAllTests} 
                            disabled={isProcessing}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3"
                        >
                            {isProcessing ? 'Tests laufen...' : 'Alle PDF Auto-Fill Tests ausführen'}
                        </Button>
                        
                        {testResultsArray.length > 0 && (
                            <Badge className={`px-4 py-2 text-base ${
                                overallCompliance >= 90 
                                    ? 'bg-green-100 text-green-800 border-green-200' 
                                    : overallCompliance >= 70 
                                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                        : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                                {overallCompliance.toFixed(1)}% Test Success Rate
                            </Badge>
                        )}
                    </div>

                    {isProcessing && (
                        <div className="mb-6">
                            <Progress value={progress} className="h-3" />
                            <p className="text-center mt-2 text-slate-600 dark:text-slate-400">
                                {currentStep} - {progress.toFixed(0)}%
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Test Results */}
            {testResultsArray.length > 0 && (
                <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <MapPin className="w-6 h-6" />
                            Detaillierte Testergebnisse
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="space-y-0">
                            {testResultsArray.map((test) => (
                                <div key={test.id} className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 last:border-b-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                {test.status === 'passed' ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                ) : test.status === 'failed' ? (
                                                    <XCircle className="w-5 h-5 text-red-600" />
                                                ) : (
                                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                                )}
                                                <h3 className="font-semibold text-slate-800 dark:text-white">
                                                    {test.name}
                                                </h3>
                                            </div>
                                            
                                            {test.formType && (
                                                <Badge variant="outline" className="text-xs mb-2">
                                                    {test.formType}
                                                </Badge>
                                            )}
                                            
                                            {test.error && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                    Fehler: {test.error.message}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="text-right">
                                            <Badge className={test.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                {test.status.toUpperCase()}
                                            </Badge>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {test.duration.toFixed(0)}ms
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Processing History */}
            {processingHistory.length > 0 && (
                <Card className="shadow-xl border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <Download className="w-6 h-6" />
                            Letzte Verarbeitungen
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="space-y-0">
                            {processingHistory.map((entry, index) => (
                                <div key={entry.processingId} className="p-4 border-b border-slate-200/60 dark:border-slate-700/60 last:border-b-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-slate-800 dark:text-white">
                                                    {entry.formType.charAt(0).toUpperCase() + entry.formType.slice(1)} Formular
                                                </h3>
                                                <Badge className={entry.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {entry.success ? 'ERFOLGREICH' : 'FEHLER'}
                                                </Badge>
                                            </div>
                                            
                                            {entry.success && (
                                                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                    <span>Qualität: {entry.qualityScore?.toFixed(2) || 'N/A'}</span>
                                                    <span>Felder: {entry.fieldsCompleted}/{entry.totalFields}</span>
                                                    <span>Konfidenz: {(entry.mappingConfidence * 100).toFixed(1)}%</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">
                                                {new Date(entry.timestamp).toLocaleString('de-DE')}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {entry.processingTime.toFixed(0)}ms
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
