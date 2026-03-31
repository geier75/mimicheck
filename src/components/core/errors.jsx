/**
 * G0.2 - FEHLER-API & TOASTS
 * Einheitliche Fehlerbehandlung und Benachrichtigungen
 */

import { track, trackError, AREA, SEVERITY } from './telemetry';

export class AppError extends Error {
    constructor(message, code, details = {}, severity = SEVERITY.MEDIUM) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.details = details;
        this.severity = severity;
        this.traceId = generateTraceId();
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            severity: this.severity,
            traceId: this.traceId,
            timestamp: this.timestamp,
        };
    }
}

export class NetworkError extends AppError {
    constructor(message, details = {}) {
        super(message, 'NETWORK_ERROR', details, SEVERITY.HIGH);
        this.name = 'NetworkError';
    }
}

export class ValidationError extends AppError {
    constructor(message, fields = {}) {
        super(message, 'VALIDATION_ERROR', { fields }, SEVERITY.LOW);
        this.name = 'ValidationError';
    }
}

export class AuthError extends AppError {
    constructor(message, details = {}) {
        super(message, 'AUTH_ERROR', details, SEVERITY.CRITICAL);
        this.name = 'AuthError';
    }
}

function generateTraceId() {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function handleError(error, area = AREA.APPLICATION, showToast = true) {
    const appError = error instanceof AppError 
        ? error 
        : new AppError(
            error.message || 'Ein unerwarteter Fehler ist aufgetreten',
            'UNKNOWN_ERROR',
            { originalError: error.toString() },
            SEVERITY.HIGH
        );

    trackError(appError, area, appError.details, appError.severity);

    if (showToast) {
        showErrorToast(appError);
    }

    console.error(`[ERROR] ${area}:`, appError.toJSON());

    return appError;
}

const toasts = [];
const MAX_TOASTS = 3;
let toastContainer = null;

export function showToast(message, type = 'info', duration = 5000) {
    if (!toastContainer) {
        initToastContainer();
    }

    const toast = {
        id: Date.now(),
        message,
        type,
    };

    if (toasts.length >= MAX_TOASTS) {
        removeToast(toasts[0].id);
    }

    toasts.push(toast);
    track('toast.shown', AREA.APPLICATION, { type, message: message.substring(0, 50) });

    renderToast(toast);

    if (duration > 0) {
        setTimeout(() => removeToast(toast.id), duration);
    }
}

export function showErrorToast(error) {
    const message = error instanceof AppError 
        ? `${error.message} (Trace: ${error.traceId.substring(0, 8)})`
        : error.message || 'Ein Fehler ist aufgetreten';
    
    showToast(message, 'error', 10000);
}

export function showSuccessToast(message) {
    showToast(message, 'success', 3000);
}

function initToastContainer() {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
    `;
    document.body.appendChild(toastContainer);
}

function renderToast(toast) {
    const toastEl = document.createElement('div');
    toastEl.id = `toast-${toast.id}`;
    toastEl.className = `toast toast-${toast.type}`;
    
    const bgColors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toastEl.style.cssText = `
        background: ${bgColors[toast.type] || bgColors.info};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
        cursor: pointer;
        transition: transform 0.2s;
    `;

    toastEl.innerHTML = `
        <span style="font-size: 18px; font-weight: bold;">${icons[toast.type]}</span>
        <span style="flex: 1;">${toast.message}</span>
    `;

    toastEl.addEventListener('click', () => removeToast(toast.id));
    toastEl.addEventListener('mouseenter', () => {
        toastEl.style.transform = 'translateX(-4px)';
    });
    toastEl.addEventListener('mouseleave', () => {
        toastEl.style.transform = 'translateX(0)';
    });

    toastContainer.appendChild(toastEl);
}

function removeToast(toastId) {
    const toastEl = document.getElementById(`toast-${toastId}`);
    if (toastEl) {
        toastEl.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            toastEl.remove();
            const index = toasts.findIndex(t => t.id === toastId);
            if (index > -1) toasts.splice(index, 1);
        }, 300);
    }
}

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}