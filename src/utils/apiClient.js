/**
 * API Client mit Best Practices
 * 
 * Features:
 * - Automatische Retry-Logik bei Netzwerkfehlern
 * - Request Timeout
 * - Zentrales Error-Handling
 * - Request/Response Logging (nur Dev)
 */

import { logger } from './logger';
import { handleError, ErrorTypes } from './errorHandler';

const DEFAULT_TIMEOUT = 10000; // 10 Sekunden
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 Sekunde

/**
 * Erstellt einen Timeout-Controller
 */
function createTimeoutController(ms = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return { controller, timeoutId };
}

/**
 * Wartet eine bestimmte Zeit
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * API Request mit Retry-Logik
 * 
 * @param {string} url - Die URL des Requests
 * @param {Object} options - Fetch-Optionen
 * @param {Object} config - Zusätzliche Konfiguration
 */
export async function apiRequest(url, options = {}, config = {}) {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
    retryDelay = RETRY_DELAY,
    retryCondition = (error) => error.type === ErrorTypes.NETWORK || error.type === ErrorTypes.SERVER
  } = config;
  
  let lastError = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const { controller, timeoutId } = createTimeoutController(timeout);
    
    try {
      logger.debug(`API Request [${attempt + 1}/${retries + 1}]`, { url, method: options.method || 'GET' });
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      
      // Response parsen
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // Fehler bei nicht-OK Status
      if (!response.ok) {
        const error = new Error(data?.message || data?.error || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      
      logger.debug('API Response', { url, status: response.status, data });
      return { data, error: null, status: response.status };
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Timeout-Fehler
      if (error.name === 'AbortError') {
        error.message = 'Request timeout';
        error.type = ErrorTypes.NETWORK;
      }
      
      lastError = handleError(error, { url, attempt: attempt + 1 });
      
      // Retry wenn Bedingung erfüllt und nicht letzter Versuch
      if (attempt < retries && retryCondition(lastError)) {
        logger.warn(`Retry in ${retryDelay}ms...`, { attempt: attempt + 1, url });
        await delay(retryDelay * (attempt + 1)); // Exponentielles Backoff
        continue;
      }
      
      break;
    }
  }
  
  return { data: null, error: lastError };
}

/**
 * Supabase Edge Function aufrufen
 */
export async function callEdgeFunction(functionName, body = {}, options = {}) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    return {
      data: null,
      error: handleError(new Error('Supabase nicht konfiguriert'), { functionName })
    };
  }
  
  const url = `${supabaseUrl}/functions/v1/${functionName}`;
  
  return apiRequest(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anonKey}`,
      ...options.headers
    },
    body: JSON.stringify(body)
  }, options);
}

/**
 * HTTP Methoden Shortcuts
 */
export const api = {
  get: (url, config) => apiRequest(url, { method: 'GET' }, config),
  
  post: (url, data, config) => apiRequest(url, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }, config),
  
  put: (url, data, config) => apiRequest(url, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }, config),
  
  patch: (url, data, config) => apiRequest(url, { 
    method: 'PATCH', 
    body: JSON.stringify(data) 
  }, config),
  
  delete: (url, config) => apiRequest(url, { method: 'DELETE' }, config),
  
  edgeFunction: callEdgeFunction
};

export default api;
