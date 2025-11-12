import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Upload, Sparkles, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';

import HeroSOTA from '@/components/landing/HeroSOTA';
import ScrollStory from '@/components/landing/ScrollStory';
import QuoteSlide from '@/components/landing/QuoteSlide';
import MosaicGallery from '@/components/landing/MosaicGallery';
import CTAEnhanced from '@/components/landing/CTAEnhanced';
import CookieBanner from '@/components/CookieBanner';
import { useEffect, useState } from 'react';

export default function LandingPage() {

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
        imageUrl="/story-upload.jpg"
        imageAlt="Person lädt Dokumente hoch"
      />

      {/* Scroll Story 2: AI Analysis */}
      <ScrollStory
        title="KI analysiert"
        description="Unsere KI durchsucht tausende Förderprogramme und findet die passenden Leistungen für dich. Sie prüft Anspruchsvoraussetzungen und bereitet alle Formulare automatisch vor. EU AI Act konform & transparent."
        imageUrl="/story-ai-analysis.jpg"
        imageAlt="KI analysiert Dokumente"
        reverse
      />

      {/* Scroll Story 3: Success */}
      <ScrollStory
        title="Geld erhalten"
        description="Prüfe die KI-vorbereiteten Anträge in Sekunden, reiche sie digital ein und verfolge den Status in Echtzeit. Vollautomatisch und sicher."
        stat="847€"
        statLabel="Mehr Förderung pro Jahr"
        imageUrl="/story-success-v2.jpg"
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

      {/* Mosaik-Galerie: Use Cases */}
      <MosaicGallery
        title="Diese Förderungen findest du mit MiMiCheck"
        items={[
          {
            title: "Wohngeld",
            description: "Bis zu 3.600€ pro Jahr für Miete oder Eigentum. Automatische Prüfung deiner Anspruchsvoraussetzungen.",
            imageUrl: "",
            color: "bg-gradient-to-br from-emerald-500 to-teal-600"
          },
          {
            title: "Kindergeld & Zuschlag",
            description: "250€ pro Kind + bis zu 292€ Zuschlag. Wir prüfen alle Varianten für dich.",
            imageUrl: "",
            color: "bg-gradient-to-br from-blue-500 to-cyan-600"
          },
          {
            title: "Elterngeld",
            description: "65-100% deines Nettoeinkommens, bis zu 1.800€/Monat. Optimale Aufteilung berechnen.",
            imageUrl: "",
            color: "bg-gradient-to-br from-purple-500 to-pink-600"
          },
          {
            title: "BAföG & Bildung",
            description: "Bis zu 934€/Monat für Studium oder Ausbildung. Inklusive Wohnzuschlag.",
            imageUrl: "",
            color: "bg-gradient-to-br from-orange-500 to-red-600"
          }
        ]}
      />

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

      <CTAEnhanced />

      <footer className="py-12 px-4 border-t border-border bg-muted/30">
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
                  <Link href="/impressum" className="hover:text-primary transition-colors">
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link href="/datenschutz" className="hover:text-primary transition-colors">
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link href="/agb" className="hover:text-primary transition-colors">
                    AGB
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Hilfe & FAQ
                  </Link>
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
