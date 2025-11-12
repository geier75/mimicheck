import { motion } from 'framer-motion';
import { Shield, Lock, Server, Gauge } from 'lucide-react';

const features = [
  { icon: Lock, label: 'DSGVO-konform' },
  { icon: Server, label: 'Edge Functions' },
  { icon: Shield, label: 'Row Level Security' },
  { icon: Gauge, label: 'Rate Limiting' },
];

export default function Trust() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-2xl border border-border/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-3xl" />
            
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: 'spring' as const, stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary to-purple-500 p-0.5"
              >
                <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold text-center mb-4"
              >
                Sicherheit & Datenschutz
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto"
              >
                Deine Daten sind bei uns in sicheren Händen. Wir setzen auf modernste Sicherheitsstandards und vollständige DSGVO-Konformität.
              </motion.p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="flex flex-col items-center gap-3 p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 transition-all duration-300"
                    >
                      <Icon className="w-6 h-6 text-primary" />
                      <span className="text-sm font-medium text-center">{feature.label}</span>
                    </motion.div>
                  );
                })}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 }}
                className="text-sm text-muted-foreground text-center"
              >
                Alle Daten werden verschlüsselt übertragen und gespeichert. Wir geben keine Daten an Dritte weiter.
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
