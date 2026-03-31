// PDF Auto-Fill Service
// Connects to Supabase Edge Function for intelligent form filling

import { mimitech } from './mimitechClient';

export class PdfFillService {
    /**
     * Calls the fill-pdf-claude Edge Function to intelligently map
     * user profile data to a PDF application form
     * 
     * @param {string} pdfUrl - URL to the uploaded PDF
     * @param {string} formType - Type of form (wohngeld, buergergeld, etc.)
     * @param {object} userProfile - User's profile data
     * @returns {Promise<FillResult>} Mapping result with suggestions and missing fields
     */
    static async fillApplication(pdfUrl, formType, userProfile) {
        try {
            const response = await mimitech.functions.invoke('fill-pdf-claude', {
                pdfUrl,
                formType,
                userProfile
            });

            if (!response.data || !response.data.success) {
                throw new Error(response.data?.error || 'PDF-Ausfüll-Service fehlgeschlagen');
            }

            return {
                success: true,
                mapping: response.data.mapping,
                stats: response.data.stats,
                message: response.data.message
            };
        } catch (error) {
            console.error('PDF Fill Error:', error);
            throw new Error(`Antragsausfüllung fehlgeschlagen: ${error.message}`);
        }
    }

    /**
     * Determines form type from PDF filename or content
     * 
     * @param {string} filename - PDF filename
     * @returns {string} Detected form type
     */
    static detectFormType(filename) {
        const lowercaseName = filename.toLowerCase();

        if (lowercaseName.includes('wohngeld')) return 'wohngeld';
        if (lowercaseName.includes('bü rgergeld') || lowercaseName.includes('buergergeld')) return 'buergergeld';
        if (lowercaseName.includes('kindergeld')) return 'kindergeld';
        if (lowercaseName.includes('elterngeld')) return 'elterngeld';
        if (lowercaseName.includes('bafög') || lowercaseName.includes('bafoeg')) return 'bafoeg';

        // Default
        return 'unbekannt';
    }

    /**
     * Formats user profile data for form filling
     * Removes sensitive data and structures it for Claude AI
     * 
     * @param {object} user - User object from database
     * @returns {object} Cleaned profile data
     */
    static prepareProfileForFilling(user) {
        return {
            vorname: user.vorname || user.full_name?.split(' ')[0],
            nachname: user.nachname || user.full_name?.split(' ').slice(1).join(' '),
            geburtsdatum: user.geburtsdatum,

            // Address
            adresse: {
                strasse: user.lebenssituation?.wohnadresse?.strasse,
                hausnummer: user.lebenssituation?.wohnadresse?.hausnummer,
                plz: user.lebenssituation?.wohnadresse?.plz,
                ort: user.lebenssituation?.wohnadresse?.ort,
                bundesland: user.lebenssituation?.wohnadresse?.bundesland
            },

            // Financial
            einkommen: {
                monatlich_netto: user.lebenssituation?.monatliches_nettoeinkommen,
                details: user.lebenssituation?.einkommen_details
            },

            vermogen: user.lebenssituation?.vermoegen,

            // Living situation
            wohnsituation: {
                wohnart: user.lebenssituation?.wohnart,
                wohnflaeche: user.lebenssituation?.wohnflaeche_qm,
                miete_kalt: user.lebenssituation?.monatliche_miete_kalt,
                nebenkosten: user.lebenssituation?.monatliche_nebenkosten,
                heizkosten: user.lebenssituation?.monatliche_heizkosten
            },

            // Family
            haushalt: {
                anzahl_personen: user.lebenssituation?.anzahl_personen_im_haushalt,
                anzahl_kinder: user.lebenssituation?.anzahl_kinder,
                familienstand: user.lebenssituation?.familienstand
            },

            // Insurance
            krankenversicherung: user.lebenssituation?.krankenversicherung,

            // Employment
            beschaeftigung: user.lebenssituation?.beschaeftigungsstatus,

            // Special circumstances
            besondere_umstaende: user.lebenssituation?.besondere_umstaende
        };
    }
}

/**
 * @typedef {Object} FillResult
 * @property {boolean} success
 * @property {MappingResult} mapping
 * @property {FillStats} stats
 * @property {string} message
 */

/**
 * @typedef {Object} MappingResult
 * @property {FieldSuggestion[]} suggestions
 * @property {MissingField[]} missingFields
 * @property {string[]} warnings
 */

/**
 * @typedef {Object} FieldSuggestion
 * @property {string} fieldName
 * @property {string} displayName
 * @property {any} suggestedValue
 * @property {number} confidence - 0-1
 * @property {string} source
 * @property {string} [note]
 */

/**
 * @typedef {Object} MissingField
 * @property {string} fieldName
 * @property {string} displayName
 * @property {string} description
 * @property {boolean} required
 */

/**
 * @typedef {Object} FillStats
 * @property {number} filledFields
 * @property {number} skippedFields
 * @property {number} totalFields
 * @property {number} completeness - 0-100%
 */
