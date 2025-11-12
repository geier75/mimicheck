import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export default function CTA() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-primary/10" />
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, type: 'spring' as const }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="relative p-16 rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-purple-600 overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative text-center text-white">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                Bereit loszulegen?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto"
              >
                Starte jetzt und erlebe, wie einfach Förderanträge sein können. Kostenlos registrieren und sofort loslegen.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/auth">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="group text-lg px-8 py-6 hover:scale-105 transition-transform duration-300"
                  >
                    Jetzt starten
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 hover:scale-105 transition-all duration-300"
                  >
                    Kontakt aufnehmen
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
