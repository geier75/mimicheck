import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Placeholder - replace with actual auth logic
    toast.success(isLogin ? 'Anmeldung erfolgreich!' : 'Registrierung erfolgreich!', {
      description: 'Du wirst zur Hauptseite weitergeleitet...'
    });
    
    // Redirect to main app after successful auth
    setTimeout(() => {
      window.location.href = '/dashboard'; // Replace with actual main app route
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </Link>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/mimicheck-logo.png" alt="MiMiCheck" className="h-16 w-16 mx-auto mb-4" width="64" height="64" />
            <h1 className="text-2xl font-bold mb-2">
              {isLogin ? 'Willkommen zurück' : 'Konto erstellen'}
            </h1>
            <p className="text-muted-foreground">
              {isLogin
                ? 'Melde dich an, um fortzufahren'
                : 'Registriere dich kostenlos'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dein Name"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                E-Mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="deine@email.de"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Passwort
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <a href="#" className="text-sm text-primary hover:underline">
                  Passwort vergessen?
                </a>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full">
              {isLogin ? 'Anmelden' : 'Registrieren'}
            </Button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? 'Noch kein Konto?' : 'Bereits registriert?'}
            </span>{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? 'Jetzt registrieren' : 'Anmelden'}
            </button>
          </div>

          {/* Legal Notice */}
          <div className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground text-center">
            Mit der Registrierung akzeptierst du unsere{' '}
            <a href="/agb" className="text-primary hover:underline">
              AGB
            </a>{' '}
            und{' '}
            <a href="/datenschutz" className="text-primary hover:underline">
              Datenschutzerklärung
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>DSGVO-konform</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>ISO zertifiziert</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>EU AI Act</span>
          </div>
        </div>
      </div>
    </div>
  );
}
