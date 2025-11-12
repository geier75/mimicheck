import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted/rejected cookies
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after 1 second delay
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-in slide-in-from-bottom duration-500"
      role="dialog"
      aria-label="Cookie Einwilligung"
      aria-describedby="cookie-banner-description"
    >
      <div className="container max-w-5xl">
        <div className="relative bg-card border border-border rounded-lg shadow-2xl p-6 md:p-8">
          <button
            onClick={handleReject}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Banner schließen"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="pr-8">
            <h3 className="text-lg md:text-xl font-semibold mb-3">
              🍪 Cookie-Einstellungen
            </h3>
            <p id="cookie-banner-description" className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed">
              Wir verwenden nur technisch notwendige Cookies für die Funktionalität dieser Website und anonyme Analytics (Umami) zur Verbesserung unseres Angebots. 
              Es werden keine personenbezogenen Daten an Dritte weitergegeben. Weitere Informationen finden Sie in unserer{' '}
              <a href="/datenschutz" className="text-primary hover:underline">
                Datenschutzerklärung
              </a>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAccept}
                size="lg"
                className="flex-1 sm:flex-none"
              >
                Alle akzeptieren
              </Button>
              <Button
                onClick={handleReject}
                variant="outline"
                size="lg"
                className="flex-1 sm:flex-none"
              >
                Nur notwendige
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="flex-1 sm:flex-none"
                asChild
              >
                <a href="/datenschutz">
                  Mehr erfahren
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
