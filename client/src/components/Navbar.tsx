import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { APP_LOGO, APP_TITLE } from '@/const';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Skip to Content Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Zum Hauptinhalt springen
      </a>
      
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
        aria-label="Hauptnavigation"
      >
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" width="32" height="32" />
            <span className="text-xl font-bold">MiMiCheck</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a 
              href="#footer"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Kontakt
            </a>

            <Button asChild>
              <a href="#auth">Anmelden</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <a 
                href="#footer"
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(false);
                  document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Kontakt
              </a>
              <Button asChild className="w-full">
                <a href="#auth" onClick={() => setIsMobileMenuOpen(false)}>Anmelden</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}
