/**
 * L2.2 - CLIENT-VALIDIERUNG
 * Zod-Schema für Nutzerprofil mit allen Validierungsregeln
 * Diese Datei wird nicht mehr benötigt, da die Validierung jetzt direkt in Lebenslagen.js ist
 * Aber wir lassen sie leer um keine Fehler zu verursachen
 */

export const userProfileSchema = null;
export const validateDependentFields = () => ({ isValid: true, errors: {} });
export const computeProfileCompletion = () => ({ score: 0, missingFields: [], totalFields: 0, filledFields: 0 });