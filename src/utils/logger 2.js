/**
 * Production-safe Logger
 * 
 * Verhindert Console-Ausgaben in Produktion, ermöglicht aber
 * strukturiertes Logging in Entwicklung.
 * 
 * @example
 * import { logger } from '@/utils/logger';
 * logger.info('User logged in', { userId: '123' });
 * logger.error('API call failed', error);
 */

const isDev = import.meta.env.DEV;
const isDebug = import.meta.env.VITE_DEBUG === 'true';

// Farben für verschiedene Log-Level
const colors = {
  info: '#3b82f6',    // blue
  warn: '#f59e0b',    // amber
  error: '#ef4444',   // red
  success: '#10b981', // emerald
  debug: '#8b5cf6',   // violet
};

/**
 * Formatiert Log-Nachrichten mit Timestamp und Kontext
 */
function formatMessage(level, message, data) {
  const timestamp = new Date().toISOString().slice(11, 23);
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  return { prefix, message, data };
}

/**
 * Logger-Objekt mit verschiedenen Log-Leveln
 */
export const logger = {
  /**
   * Informative Nachrichten (nur in Dev)
   */
  info(message, data = null) {
    if (!isDev) return;
    const { prefix } = formatMessage('info', message, data);
    console.log(
      `%c${prefix}%c ${message}`,
      `color: ${colors.info}; font-weight: bold`,
      'color: inherit',
      data || ''
    );
  },

  /**
   * Warnungen (nur in Dev)
   */
  warn(message, data = null) {
    if (!isDev) return;
    const { prefix } = formatMessage('warn', message, data);
    console.warn(
      `%c${prefix}%c ${message}`,
      `color: ${colors.warn}; font-weight: bold`,
      'color: inherit',
      data || ''
    );
  },

  /**
   * Fehler (immer loggen, aber in Prod an Error-Tracking senden)
   */
  error(message, error = null) {
    const { prefix } = formatMessage('error', message, error);
    
    // In Produktion: An Error-Tracking Service senden
    if (!isDev) {
      // TODO: Sentry, LogRocket, etc.
      // Sentry.captureException(error);
      return;
    }
    
    console.error(
      `%c${prefix}%c ${message}`,
      `color: ${colors.error}; font-weight: bold`,
      'color: inherit',
      error || ''
    );
  },

  /**
   * Erfolgs-Nachrichten (nur in Dev)
   */
  success(message, data = null) {
    if (!isDev) return;
    const { prefix } = formatMessage('success', message, data);
    console.log(
      `%c${prefix}%c ✅ ${message}`,
      `color: ${colors.success}; font-weight: bold`,
      'color: inherit',
      data || ''
    );
  },

  /**
   * Debug-Nachrichten (nur wenn VITE_DEBUG=true)
   */
  debug(message, data = null) {
    if (!isDev || !isDebug) return;
    const { prefix } = formatMessage('debug', message, data);
    console.log(
      `%c${prefix}%c 🔍 ${message}`,
      `color: ${colors.debug}; font-weight: bold`,
      'color: inherit',
      data || ''
    );
  },

  /**
   * Gruppierten Log starten
   */
  group(label) {
    if (!isDev) return;
    console.group(`📦 ${label}`);
  },

  /**
   * Gruppierte Logs beenden
   */
  groupEnd() {
    if (!isDev) return;
    console.groupEnd();
  },

  /**
   * Tabelle ausgeben (nur in Dev)
   */
  table(data) {
    if (!isDev) return;
    console.table(data);
  },

  /**
   * Performance-Messung starten
   */
  time(label) {
    if (!isDev) return;
    console.time(`⏱️ ${label}`);
  },

  /**
   * Performance-Messung beenden
   */
  timeEnd(label) {
    if (!isDev) return;
    console.timeEnd(`⏱️ ${label}`);
  }
};

// Default Export für einfache Nutzung
export default logger;
