import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Upload, Sparkles, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';

import HeroSOTA from '@/components/landing/HeroSOTA';
import ScrollStory from '@/components/landing/ScrollStory';
import QuoteSlide from '@/components/landing/QuoteSlide';
import MosaicGallery from '@/components/landing/MosaicGallery';
import CTAEnhanced from '@/components/landing/CTAEnhanced';
import CookieBanner from '@/components/CookieBanner';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: { name: formData.name || formData.email } },
        });
        if (error) throw error;
        
        // Bei Signup ohne sofortige Session: Email-Bestätigung erforderlich
        if (!signUpData.session) {
          setError('Registrierung erfolgreich! Bitte bestätige deine E-Mail, um dich anzumelden.');
          setLoading(false);
          setIsLogin(true); // Wechsel zu Login für spätere Anmeldung
          return;
        }
      }
      
      const { data, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) throw sessErr;
      const access_token = data.session?.access_token;
      const refresh_token = data.session?.refresh_token as string | undefined;
      if (!access_token || !refresh_token) {
        throw new Error('Kein Session-Token verfügbar. Bitte E-Mail bestätigen oder erneut versuchen.');
      }
      const emailParam = encodeURIComponent(formData.email);
      const nameParam = encodeURIComponent(formData.name || '');
      const qs = `access_token=${encodeURIComponent(access_token)}&refresh_token=${encodeURIComponent(refresh_token)}&email=${emailParam}&name=${nameParam}`;
      const dest = `${window.location.origin}/auth-bridge?${qs}`;
      window.location.href = dest;
    } catch (err: any) {
      setError(err?.message || String(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div id="main-content" />
      <Navbar />

      {/* Hero Section - SOTA 2025 */}
      <HeroSOTA />

      {/* Scroll Story 1: Upload */}
      <ScrollStory
        title="Dokumente hochladen"
        description="Lade deine Abrechnungen, Belege und Nachweise einfach hoch. Unsere KI erkennt automatisch relevante Informationen und prüft, welche Förderungen für dich in Frage kommen. Drag & Drop oder Datei auswählen – fertig."
        imageUrl="/landing/story-upload.jpg"
        imageAlt="Person lädt Dokumente hoch"
      />

      {/* Scroll Story 2: AI Analysis */}
      <ScrollStory
        title="KI analysiert"
        description="Unsere KI durchsucht tausende Förderprogramme und findet die passenden Leistungen für dich. Sie prüft Anspruchsvoraussetzungen und bereitet alle Formulare automatisch vor. EU AI Act konform & transparent."
        imageUrl="/landing/story-ai-analysis.jpg"
        imageAlt="KI analysiert Dokumente"
        reverse
      />

      {/* Scroll Story 3: Success */}
      <ScrollStory
        title="Geld erhalten"
        description="Prüfe die KI-vorbereiteten Anträge in Sekunden, reiche sie digital ein und verfolge den Status in Echtzeit. Vollautomatisch und sicher."
        stat="847€"
        statLabel="Mehr Förderung pro Jahr"
        imageUrl="/landing/story-success-v2.jpg"
        imageAlt="Erfolgreiche Förderung genehmigt"
      />

      {/* Quote Slide 1 */}
      <QuoteSlide
        quote="Endlich verstehe ich, welche Förderungen mir zustehen. MiMiCheck hat mir geholfen, über 2.000€ Wohngeld zu beantragen – einfach und schnell!"
        author="Sarah M."
        role="Alleinerziehende Mutter, Berlin"
        bgColor="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10"
      />

      {/* Quote Slide 2 */}
      <QuoteSlide
        quote="Die KI hat alle meine Belege analysiert und mir gezeigt, dass ich Anspruch auf Kindergeldzuschlag habe. Das hätte ich alleine nie herausgefunden."
        author="Michael K."
        role="Vater von 3 Kindern, München"
        bgColor="bg-gradient-to-br from-blue-500/10 to-purple-500/10"
      />

      {/* Förderungen Section - NEUE EINFACHE VERSION */}
      <section className="py-32 px-4 bg-slate-950">
        <div className="container max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-white">
            Diese Förderungen findest du mit MiMiCheck
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Wohngeld Card MIT BILD */}
            <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-xl cursor-pointer">
              {/* BILD - DIREKT SICHTBAR */}
              <img
                src="/images/placeholder-keys.svg"
                alt="Wohngeld"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Leichter Overlay für Lesbarkeit */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20" />
              
              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white drop-shadow-2xl">
                  Wohngeld
                </h3>
                <p className="text-white text-lg leading-relaxed drop-shadow-xl">
                  Bis zu 3.600€ pro Jahr für Miete oder Eigentum. Automatische Prüfung deiner Anspruchsvoraussetzungen.
                </p>
              </div>
            </div>

            {/* Kindergeld Card MIT BILD */}
            <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-xl cursor-pointer">
              {/* BILD */}
              <img
                src="/images/card-kindergeld.svg"
                alt="Kindergeld & Zuschlag"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Overlay für Lesbarkeit */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />

              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                  Kindergeld & Zuschlag
                </h3>
                <p className="text-white/90 text-lg leading-relaxed">
                  250€ pro Kind + bis zu 292€ Zuschlag. Wir prüfen alle Varianten für dich.
                </p>
              </div>
            </div>

            {/* Elterngeld Card MIT BILD */}
            <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-xl cursor-pointer">
              {/* BILD */}
              <img
                src="/images/card-elterngeld.svg"
                alt="Elterngeld"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Overlay für Lesbarkeit */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />

              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                  Elterngeld
                </h3>
                <p className="text-white/90 text-lg leading-relaxed">
                  65-100% deines Nettoeinkommens, bis zu 1.800€/Monat. Optimale Aufteilung berechnen.
                </p>
              </div>
            </div>

            {/* BAföG Card MIT BILD */}
            <div className="group relative aspect-square rounded-2xl overflow-hidden shadow-xl cursor-pointer">
              {/* BILD */}
              <img
                src="/images/card-bafoeg.svg"
                alt="BAföG & Bildung"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Overlay für Lesbarkeit */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20" />

              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                  BAföG & Bildung
                </h3>
                <p className="text-white/90 text-lg leading-relaxed">
                  Bis zu 934€/Monat für Studium oder Ausbildung. Inklusive Wohnzuschlag.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-muted/30" aria-label="KI-Transparenz und EU AI Act Konformität">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Transparente KI-Nutzung
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12">
              Gemäß EU AI Act informieren wir transparent über unsere KI-Systeme
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'KI-Einsatz',
                  desc: 'Unsere KI-Systeme sind klar dokumentiert und dürfen Formulare automatisch ausfüllen. Die finale Kontrolle liegt immer bei dir.',
                },
                {
                  title: 'Nachvollziehbarkeit',
                  desc: 'Alle KI-Vorschläge sind transparent dokumentiert und können jederzeit überprüft werden.',
                },
                {
                  title: 'Menschliche Aufsicht',
                  desc: 'Jeder Antrag wird von qualifizierten Mitarbeitern überprüft und freigegeben.',
                },
                {
                  title: 'Risikoklassifizierung',
                  desc: 'Unser System ist als AI-Assistent mit niedrigem Risiko AI klassifiziert und erfüllt alle Transparenzpflichten des EU AI Acts.',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors duration-300"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="auth" className="py-24 px-4 bg-muted/30">
        <div className="container max-w-3xl">
          <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{isLogin ? 'Anmelden' : 'Registrieren'}</h2>
              <button
                className="text-sm text-primary hover:underline"
                onClick={() => setIsLogin(v => !v)}
                type="button"
              >
                {isLogin ? 'Jetzt registrieren' : 'Bereits Konto? Anmelden'}
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded px-3 py-2 bg-background"
                    required
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">E-Mail</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-background"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">Passwort</label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-background"
                  required
                  minLength={8}
                />
              </div>
              {error && <p className={`text-sm ${error.includes('erfolgreich') ? 'text-green-600' : 'text-red-600'}`}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 rounded bg-primary text-primary-foreground"
              >
                {loading ? 'Bitte warten…' : (isLogin ? 'Login' : 'Konto anlegen')}
              </button>
            </form>
          </div>
        </div>
      </section>

      <CTAEnhanced />

      <footer id="footer" className="py-12 px-4 border-t border-border bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">MiMiCheck by MiMiTech AI</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Dein digitaler Assistent für Förderanträge – sicher, transparent und DSGVO-konform.
              </p>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">MiMi Tech Ai UG (haftungsbeschränkt)</p>
                <p>Lindenplatz 23</p>
                <p>75378 Bad Liebenzell</p>
                <p className="mt-2">
                  <a href="mailto:info@mimitechai.com" className="hover:text-primary transition-colors">
                    info@mimitechai.com
                  </a>
                </p>
                <p>
                  <a href="tel:+4915758805737" className="hover:text-primary transition-colors">
                    +49 1575 8805737
                  </a>
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Rechtliches</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/impressum" className="hover:text-primary transition-colors">
                    Impressum
                  </a>
                </li>
                <li>
                  <a href="/datenschutz" className="hover:text-primary transition-colors">
                    Datenschutz
                  </a>
                </li>
                <li>
                  <a href="/agb" className="hover:text-primary transition-colors">
                    AGB
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/contact" className="hover:text-primary transition-colors">
                    Hilfe & FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 MiMi Tech Ai UG (haftungsbeschränkt). Alle Rechte vorbehalten.</p>
            <p className="mt-2">
              MiMiCheck – Entwickelt mit ❤️ für EU AI Act & ISO Konformität | LCP &lt; 2.5s | A11y AA & SOTA 2025 konform
            </p>
          </div>
        </div>
      </footer>
      
      <CookieBanner />
    </div>
  );
}
