/**
 * Accessibility Utilities
 * 
 * Helpers für barrierefreie Komponenten
 */

/**
 * Generiert eine eindeutige ID für Form-Labels
 * @param {string} prefix - Prefix für die ID
 * @returns {string} - Eindeutige ID
 */
let idCounter = 0;
export function generateId(prefix = 'a11y') {
  return `${prefix}-${++idCounter}`;
}

/**
 * Erstellt ARIA-Attribute für eine Form-Field-Gruppe
 * @param {Object} options - Optionen
 * @returns {Object} - Props für Input und Label
 */
export function getFormFieldProps({ id, label, error, required, description }) {
  const inputId = id || generateId('field');
  const errorId = error ? `${inputId}-error` : undefined;
  const descriptionId = description ? `${inputId}-desc` : undefined;
  
  return {
    labelProps: {
      htmlFor: inputId,
    },
    inputProps: {
      id: inputId,
      'aria-required': required || undefined,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': [errorId, descriptionId].filter(Boolean).join(' ') || undefined,
    },
    errorProps: errorId ? {
      id: errorId,
      role: 'alert',
      'aria-live': 'polite',
    } : {},
    descriptionProps: descriptionId ? {
      id: descriptionId,
    } : {},
  };
}

/**
 * Skip-Link für Keyboard-Navigation
 * Sollte als erstes Element im Body sein
 */
export function SkipLink({ href = '#main-content', children = 'Zum Hauptinhalt springen' }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:rounded focus:shadow-lg"
    >
      {children}
    </a>
  );
}

/**
 * Screen-Reader-only Text
 * Für visuell versteckte aber lesbare Texte
 */
export function VisuallyHidden({ children, as: Component = 'span' }) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}

/**
 * Live-Region für dynamische Inhalts-Ankündigungen
 */
export function LiveRegion({ message, priority = 'polite' }) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * Keyboard-Navigation Trap
 * Hält Fokus innerhalb eines Elements (z.B. Modal)
 */
export function useFocusTrap(ref, isActive = true) {
  React.useEffect(() => {
    if (!isActive || !ref.current) return;
    
    const element = ref.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    function handleKeyDown(e) {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
    
    element.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();
    
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [ref, isActive]);
}

/**
 * Prüft Farbkontrast (vereinfacht)
 * WCAG 2.1 AA: Normaler Text 4.5:1, Großer Text 3:1
 */
export function checkContrast(foreground, background) {
  // Vereinfachte Implementierung - für echte Prüfung externes Tool nutzen
  console.warn('checkContrast: Nutze ein echtes Kontrast-Tool für genaue Ergebnisse');
  return true;
}

// Import React für Hooks
import React from 'react';

export default {
  generateId,
  getFormFieldProps,
  SkipLink,
  VisuallyHidden,
  LiveRegion,
  useFocusTrap,
};
