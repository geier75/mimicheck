/**
 * Utils Index
 * 
 * Zentrale Export-Datei für alle Utility-Funktionen
 */

// Logging
export { logger } from './logger';

// Error Handling
export { 
  handleError, 
  getUserMessage, 
  categorizeError, 
  withErrorHandler,
  useErrorHandler,
  ErrorTypes 
} from './errorHandler';

// API Client
export { api, apiRequest, callEdgeFunction } from './apiClient';

// Navigation Helpers
/**
 * Erstellt eine URL für eine Seite basierend auf dem Namen
 * @param {string} pageName - Name der Seite (z.B. "Dashboard", "ProfilSeite")
 * @returns {string} - Die URL (z.B. "/dashboard", "/profilseite")
 */
export function createPageUrl(pageName) {
  return '/' + pageName.toLowerCase().replace(/ /g, '-');
}
