import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, BarChart3, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COOKIE_CONSENT_KEY = 'mimicheck_cookie_consent';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Immer an
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Kurze Verzögerung für bessere UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const saveConsent = (type) => {
    const consentData = {
      timestamp: new Date().toISOString(),
      preferences: type === 'all' 
        ? { essential: true, analytics: true, marketing: true }
        : type === 'essential'
        ? { essential: true, analytics: false, marketing: false }
        : preferences,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                Wir respektieren Ihre Privatsphäre
              </h3>
              <p className="text-sm text-slate-400">
                MiMiCheck verwendet Cookies, um Ihnen die bestmögliche Erfahrung zu bieten. 
                Wir speichern Ihre Daten DSGVO-konform auf Servern in der EU.
              </p>
            </div>
            <button 
              onClick={() => saveConsent('essential')}
              className="text-slate-500 hover:text-white transition-colors"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Details (wenn erweitert) */}
        {showDetails && (
          <div className="px-6 pb-4 space-y-3 border-t border-slate-700/50 pt-4">
            {/* Essenziell */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-white">Essenzielle Cookies</p>
                  <p className="text-xs text-slate-400">Für Login, Sicherheit & Grundfunktionen</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                Immer aktiv
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-white">Analyse-Cookies</p>
                  <p className="text-xs text-slate-400">Hilft uns, die App zu verbessern</p>
                </div>
              </div>
              <button 
                onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.analytics ? 'bg-blue-500' : 'bg-slate-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  preferences.analytics ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-white">Marketing-Cookies</p>
                  <p className="text-xs text-slate-400">Für personalisierte Angebote</p>
                </div>
              </div>
              <button 
                onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.marketing ? 'bg-purple-500' : 'bg-slate-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  preferences.marketing ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="p-6 pt-4 flex flex-wrap gap-3 border-t border-slate-700/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-slate-300 border-slate-600 hover:bg-slate-800"
          >
            {showDetails ? 'Weniger anzeigen' : 'Einstellungen'}
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveConsent('essential')}
            className="text-slate-300 border-slate-600 hover:bg-slate-800"
          >
            Nur Essenzielle
          </Button>
          <Button
            size="sm"
            onClick={() => saveConsent(showDetails ? 'custom' : 'all')}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            {showDetails ? 'Auswahl speichern' : 'Alle akzeptieren'}
          </Button>
        </div>

        {/* Legal Links */}
        <div className="px-6 pb-4 flex gap-4 text-xs text-slate-500">
          <a href="/datenschutz" className="hover:text-slate-300 transition-colors">
            Datenschutzerklärung
          </a>
          <a href="/impressum" className="hover:text-slate-300 transition-colors">
            Impressum
          </a>
        </div>
      </div>
    </div>
  );
}

// Hook zum Prüfen der Cookie-Einwilligung
export function useCookieConsent() {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      try {
        setConsent(JSON.parse(stored));
      } catch {
        setConsent(null);
      }
    }
  }, []);

  return consent;
}
