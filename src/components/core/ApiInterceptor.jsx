/**
 * K1.1 - API INTERCEPTOR
 * Modern fetch wrapper with automatic tracking and loader integration
 * 2025 Best Practice: No global interceptors, explicit wrapper pattern
 */

import { useEffect } from 'react';
import { useLoader } from './LoaderContext';
import { handleError, NetworkError, AuthError } from './errors';
import { track, trackPerformance, AREA, SEVERITY } from './telemetry';

// Global fetch wrapper for automatic tracking
const originalFetch = window.fetch;
let loaderCallbacks = { incrementPending: null, decrementPending: null };

window.fetch = async function (...args) {
    const [resource, config] = args;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    const url = typeof resource === 'string' ? resource : resource.url;
    const method = config?.method || 'GET';

    // Increment pending counter
    if (loaderCallbacks.incrementPending) {
        loaderCallbacks.incrementPending();
    }

    track('net.request.start', AREA.APPLICATION, {
        method,
        url,
        requestId,
    }, SEVERITY.LOW);

    try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;

        // Decrement pending counter
        if (loaderCallbacks.decrementPending) {
            loaderCallbacks.decrementPending();
        }

        trackPerformance('request', AREA.APPLICATION, duration, {
            method,
            url,
            status: response.status,
            requestId,
        });

        // Handle HTTP errors
        if (!response.ok) {
            const status = response.status;
            
            if (status === 401 || status === 403) {
                handleError(
                    new AuthError('Authentifizierung fehlgeschlagen', {
                        status,
                        url,
                    }),
                    AREA.APPLICATION,
                    false // Don't show toast for auth errors (handled by app)
                );
            } else if (status >= 500) {
                handleError(
                    new NetworkError('Server-Fehler', {
                        status,
                        url,
                    }),
                    AREA.APPLICATION
                );
            }
        }

        return response;
    } catch (error) {
        const duration = Date.now() - startTime;

        // Decrement pending counter
        if (loaderCallbacks.decrementPending) {
            loaderCallbacks.decrementPending();
        }

        trackPerformance('request.failed', AREA.APPLICATION, duration, {
            method,
            url,
            requestId,
            error: error.message,
        });

        // Network error (fetch rejection)
        handleError(
            new NetworkError('Netzwerkfehler - Keine Verbindung zum Server', {
                url,
                originalError: error.message,
            }),
            AREA.APPLICATION
        );

        throw error;
    }
};

export function ApiInterceptor() {
    const { incrementPending, decrementPending } = useLoader();

    useEffect(() => {
        // Register loader callbacks for fetch wrapper
        loaderCallbacks.incrementPending = incrementPending;
        loaderCallbacks.decrementPending = decrementPending;

        return () => {
            // Cleanup callbacks on unmount
            loaderCallbacks.incrementPending = null;
            loaderCallbacks.decrementPending = null;
        };
    }, [incrementPending, decrementPending]);

    return null;
}