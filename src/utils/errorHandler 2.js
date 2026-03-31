/**
 * Zentraler Error Handler
 * 
 * Best Practice: Alle Fehler an einer Stelle behandeln
 * für konsistentes Error-Handling und Logging.
 */

import { logger } from './logger';

/**
 * API-Fehler Typen
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Kategorisiert Fehler basierend auf Status-Code oder Typ
 */
export function categorizeError(error) {
  if (!error) return ErrorTypes.UNKNOWN;
  
  // Netzwerk-Fehler
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return ErrorTypes.NETWORK;
  }
  
  // HTTP Status-basiert
  const status = error.status || error.statusCode;
  if (status) {
    if (status === 401 || status === 403) return ErrorTypes.AUTH;
    if (status === 404) return ErrorTypes.NOT_FOUND;
    if (status === 422 || status === 400) return ErrorTypes.VALIDATION;
    if (status >= 500) return ErrorTypes.SERVER;
  }
  
  // Supabase-spezifische Fehler
  if (error.code) {
    if (error.code.includes('auth')) return ErrorTypes.AUTH;
    if (error.code.includes('validation')) return ErrorTypes.VALIDATION;
  }
  
  return ErrorTypes.UNKNOWN;
}

/**
 * Benutzerfreundliche Fehlermeldungen
 */
const userMessages = {
  [ErrorTypes.NETWORK]: 'Keine Internetverbindung. Bitte überprüfen Sie Ihre Verbindung.',
  [ErrorTypes.AUTH]: 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
  [ErrorTypes.VALIDATION]: 'Bitte überprüfen Sie Ihre Eingaben.',
  [ErrorTypes.NOT_FOUND]: 'Die angeforderten Daten wurden nicht gefunden.',
  [ErrorTypes.SERVER]: 'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
  [ErrorTypes.UNKNOWN]: 'Ein unerwarteter Fehler ist aufgetreten.'
};

/**
 * Gibt eine benutzerfreundliche Fehlermeldung zurück
 */
export function getUserMessage(error) {
  const type = categorizeError(error);
  return userMessages[type] || userMessages[ErrorTypes.UNKNOWN];
}

/**
 * Zentraler Error Handler
 * 
 * @param {Error} error - Der aufgetretene Fehler
 * @param {Object} context - Zusätzlicher Kontext (z.B. { component: 'Profile', action: 'save' })
 * @returns {Object} - { type, message, userMessage }
 */
export function handleError(error, context = {}) {
  const type = categorizeError(error);
  const userMessage = getUserMessage(error);
  
  // Strukturiertes Logging
  logger.error('Error occurred', {
    type,
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    context,
    timestamp: new Date().toISOString()
  });
  
  // Bei Auth-Fehlern: Session löschen und zur Login-Seite
  if (type === ErrorTypes.AUTH) {
    try {
      localStorage.removeItem('mimicheck-auth');
    } catch (_) {}
  }
  
  return {
    type,
    message: error?.message || 'Unknown error',
    userMessage,
    isRetryable: [ErrorTypes.NETWORK, ErrorTypes.SERVER].includes(type)
  };
}

/**
 * Wrapper für async Funktionen mit Error-Handling
 * 
 * @example
 * const result = await withErrorHandler(
 *   async () => await api.getData(),
 *   { component: 'DataList', action: 'fetch' }
 * );
 */
export async function withErrorHandler(asyncFn, context = {}) {
  try {
    return { data: await asyncFn(), error: null };
  } catch (error) {
    return { data: null, error: handleError(error, context) };
  }
}

/**
 * React Hook für Error-Handling
 */
export function useErrorHandler() {
  return {
    handleError,
    getUserMessage,
    categorizeError,
    withErrorHandler
  };
}

export default {
  handleError,
  getUserMessage,
  categorizeError,
  withErrorHandler,
  ErrorTypes
};
