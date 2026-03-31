/**
 * G0.1 - TELEMETRIE-STANDARD (SAFE VERSION)
 */

const TELEMETRY_CONFIG = {
    enabled: true,
    sampling: {
        default: 1.0,
        navigation: 0.5,
        interaction: 0.3,
    },
    consoleDebug: true,
};

export const SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

export const AREA = {
    LAYOUT: 'Layout',
    DASHBOARD: 'Dashboard',
    PROFILE: 'Profile',
    UPLOAD: 'Upload',
    BILLING: 'Billing',
    AGENT: 'Agent',
    REPORT: 'Report',
    APPLICATION: 'Application',
    ASSISTANT: 'Assistant',
};

const eventCache = new Map();
const CACHE_TTL = 5000;

export function track(eventName, area = AREA.APPLICATION, meta = {}, severity = SEVERITY.LOW) {
    if (!TELEMETRY_CONFIG.enabled) return;

    const samplingRate = TELEMETRY_CONFIG.sampling[getSamplingCategory(eventName)] || TELEMETRY_CONFIG.sampling.default;
    if (Math.random() > samplingRate) return;

    const eventKey = `${eventName}:${JSON.stringify(meta)}`;
    if (eventCache.has(eventKey)) {
        const lastTime = eventCache.get(eventKey);
        if (Date.now() - lastTime < CACHE_TTL) return;
    }
    eventCache.set(eventKey, Date.now());

    const payload = {
        event: eventName,
        area,
        severity,
        timestamp: new Date().toISOString(),
        meta: {
            ...meta,
            userAgent: navigator?.userAgent || 'unknown',
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
            sessionId: getSessionId(),
        }
    };

    if (TELEMETRY_CONFIG.consoleDebug) {
        const severityIcon = {
            [SEVERITY.LOW]: '🔵',
            [SEVERITY.MEDIUM]: '🟡',
            [SEVERITY.HIGH]: '🟠',
            [SEVERITY.CRITICAL]: '🔴',
        };
        console.log(
            `${severityIcon[severity]} [TELEMETRY] ${area}.${eventName}`,
            meta
        );
    }

    try {
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            const evt = new CustomEvent('telemetry', { detail: payload });
            window.dispatchEvent(evt);
        }
    } catch (e) {}

    if (typeof window !== 'undefined' && window.MiMiCheckObservability) {
        try {
            window.MiMiCheckObservability.trackUserInteraction(eventName, area, payload.meta);
        } catch (error) {
            console.error('Telemetry send failed:', error);
        }
    }
}

function getSamplingCategory(eventName) {
    if (eventName.includes('nav.') || eventName.includes('navigation')) return 'navigation';
    if (eventName.includes('click') || eventName.includes('interaction')) return 'interaction';
    return 'default';
}

function getSessionId() {
    if (typeof sessionStorage === 'undefined') return 'ssr';
    
    let sessionId = sessionStorage.getItem('telemetry_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('telemetry_session_id', sessionId);
    }
    return sessionId;
}

export function trackPerformance(metricName, area, durationMs, meta = {}) {
    track(`perf.${metricName}`, area, {
        ...meta,
        duration_ms: durationMs,
    }, SEVERITY.MEDIUM);
}

export function trackError(error, area, meta = {}, severity = SEVERITY.HIGH) {
    track(`error.${error?.name || 'unknown'}`, area, {
        ...meta,
        message: error?.message || 'Unknown error',
        stack: error?.stack || '',
    }, severity);
}