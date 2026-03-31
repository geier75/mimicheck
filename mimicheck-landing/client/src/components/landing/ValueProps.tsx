import { motion } from 'framer-motion';
import { FileText, Shield, Zap } from 'lucide-react';

const props = [
  {
    icon: FileText,
    title: 'Automatisches Ausfüllen',
    description:
      'Unsere KI analysiert deine Dokumente und füllt Förderanträge automatisch aus – spart Zeit und reduziert Fehler.',
    gradient: 'from-blue-500 to-cyan-500',
    delay: 0,
  },
  {
    icon: Shield,
    title: 'Datenschutz zuerst',
    description:
      'DSGVO-konform mit RLS, Edge Functions und CORS-Allowlist. Deine Daten bleiben sicher und privat.',
    gradient: 'from-purple-500 to-pink-500',
    delay: 0.1,
  },
  {
    icon: Zap,
    title: 'Schnell zum Ergebnis',
    description:
      'Upload, Empfehlungen erhalten und Status verfolgen – alles in einer intuitiven Oberfläche.',
    gradient: 'from-orange-500 to-red-500',
    delay: 0.2,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function ValueProps() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Warum MiMiCheck?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Moderne Technologie trifft auf einfache Bedienung – für schnellere und präzisere Förderanträge.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-3 gap-8"
        >
          {props.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <motion.div
                key={index}
                variants={item}
                whileHover={{
                  y: -8,
                  transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
                }}
                className="group relative"
              >
                {/* Card background with glassmorphism */}
                <div className="absolute inset-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl rounded-2xl border border-border/50 transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-2xl group-hover:shadow-primary/10" />
                
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${prop.gradient} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-opacity duration-300`} />

                <div className="relative p-8">
                  {/* Icon with gradient background */}
                  <div className="mb-6 relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${prop.gradient} opacity-20 rounded-2xl blur-xl`} />
                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${prop.gradient} p-0.5`}>
                      <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                    {prop.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {prop.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
