/**
 * AI Profile Helper Utilities
 * 
 * Helfer-Funktionen für die KI, um User-Profil zu verstehen
 * und intelligente Vorschläge zu machen
 */

/**
 * Generiert einen formatierten Profil-Context für AI System Prompt
 * 
 * @param {object} user - User object from database
 * @returns {string} Formatted context string for AI
 */
export function generateAIProfileContext(user) {
    if (!user) {
        return "User-Profil nicht geladen. Frage nach benötigten Informationen.";
    }

    const completion = calculateProfileCompletion(user);
    const ctx = [];

    ctx.push(`**Profil-Status**: ${completion.percentage}% vollständig\n`);

    if (completion.percentage === 100) {
        ctx.push("✅ **Das Profil ist vollständig!** Du kannst direkt Anträge ausfüllen.\n");
    } else {
        ctx.push(`⚠️  **Fehlende Felder**: ${completion.missingFields.join(', ')}\n`);
    }

    // Basic Info
    if (user.vorname || user.full_name) {
        ctx.push(`**Name**: ${user.vorname || user.full_name}`);
    }

    if (user.geburtsdatum) {
        ctx.push(`**Geburtsdatum**: ${user.geburtsdatum}`);
    }

    // Address
    const addr = user.lebenssituation?.wohnadresse;
    if (addr?.plz && addr?.ort) {
        ctx.push(`**Adresse**: ${addr.plz} ${addr.ort}`);
    }

    // Financial
    const einkommen = user.lebenssituation?.monatliches_nettoeinkommen;
    if (einkommen) {
        ctx.push(`**Einkommen**: ${einkommen}€/Monat`);
    }

    const wohnart = user.lebenssituation?.wohnart;
    if (wohnart) {
        ctx.push(`**Wohnart**: ${wohnart}`);
    }

    const miete = user.lebenssituation?.monatliche_miete_kalt;
    if (miete) {
        ctx.push(`**Miete (kalt)**: ${miete}€/Monat`);
    }

    return ctx.join('\n');
}

/**
 * Berechnet Profil-Vollständigkeit
 * 
 * @param {object} user - User object
 * @returns {object} { percentage, missingFields[], filledFields[] }
 */
export function calculateProfileCompletion(user) {
    const requiredFields = [
        { key: 'vorname', label: 'Vorname', getter: (u) => u.vorname || u.full_name },
        { key: 'geburtsdatum', label: 'Geburtsdatum', getter: (u) => u.geburtsdatum },
        { key: 'plz', label: 'PLZ', getter: (u) => u.lebenssituation?.wohnadresse?.plz },
        { key: 'ort', label: 'Ort', getter: (u) => u.lebenssituation?.wohnadresse?.ort },
        { key: 'wohnart', label: 'Wohnart', getter: (u) => u.lebenssituation?.wohnart },
        { key: 'einkommen', label: 'Einkommen', getter: (u) => u.lebenssituation?.monatliches_nettoeinkommen },
    ];

    const missingFields = [];
    const filledFields = [];

    requiredFields.forEach(field => {
        const value = field.getter(user);
        if (value) {
            filledFields.push(field.label);
        } else {
            missingFields.push(field.label);
        }
    });

    const percentage = Math.round((filledFields.length / requiredFields.length) * 100);

    return {
        percentage,
        missingFields,
        filledFields,
        totalFields: requiredFields.length
    };
}

/**
 * Prüft, ob User ein bestimmtes Feld ausgefüllt hat
 * 
 * @param {object} user - User object
 * @param {string} fieldName - Field name to check
 * @returns {boolean}
 */
export function hasProfileField(user, fieldName) {
    const fieldMap = {
        'vorname': (u) => u.vorname || u.full_name?.split(' ')[0],
        'nachname': (u) => u.nachname || u.full_name?.split(' ').slice(1).join(' '),
        'geburtsdatum': (u) => u.geburtsdatum,
        'plz': (u) => u.lebenssituation?.wohnadresse?.plz,
        'ort': (u) => u.lebenssituation?.wohnadresse?.ort,
        'strasse': (u) => u.lebenssituation?.wohnadresse?.strasse,
        'wohnart': (u) => u.lebenssituation?.wohnart,
        'einkommen': (u) => u.lebenssituation?.monatliches_nettoeinkommen,
        'miete': (u) => u.lebenssituation?.monatliche_miete_kalt,
        'vermogen': (u) => u.lebenssituation?.vermoegen,
    };

    const getter = fieldMap[fieldName];
    if (!getter) return false;

    const value = getter(user);
    return value !== null && value !== undefined && value !== '';
}

/**
 * Liefert fehlende Felder für einen bestimmten Antragstyp
 * 
 * @param {object} user - User object
 * @param {string} formType - Form type (wohngeld, buergergeld, etc.)
 * @returns {string[]} Array of missing field labels
 */
export function getMissingFieldsForForm(user, formType) {
    const baseFields = ['vorname', 'nachname', 'geburtsdatum', 'plz', 'ort'];

    const formSpecificFields = {
        'wohngeld': ['wohnart', 'miete', 'einkommen'],
        'buergergeld': ['einkommen', 'vermogen'],
        'kindergeld': ['anzahl_kinder'],
        'elterngeld': ['anzahl_kinder', 'einkommen'],
        'bafoeg': ['einkommen'],
    };

    const requiredFields = [...baseFields, ...(formSpecificFields[formType] || [])];

    return requiredFields.filter(field => !hasProfileField(user, field));
}
