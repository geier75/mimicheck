import { motion } from 'framer-motion';
import { UserPlus, Upload, Sparkles } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Konto anlegen',
    description: 'Registriere dich kostenlos und sicher – in weniger als einer Minute.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    number: 2,
    icon: Upload,
    title: 'Dokumente hochladen',
    description: 'Lade deine Abrechnungen und Unterlagen hoch – wir kümmern uns um den Rest.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: 3,
    icon: Sparkles,
    title: 'KI füllt vor',
    description: 'Unsere KI analysiert deine Daten und bereitet Förderanträge automatisch vor.',
    color: 'from-orange-500 to-red-500',
  },
];

export default function Steps() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            So einfach geht's
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            In drei einfachen Schritten zu deinem automatisch ausgefüllten Förderantrag.
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.2,
                    type: 'spring' as const,
                    stiffness: 100,
                  }}
                  className="relative"
                >
                  <div className="relative group">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.2 + 0.3,
                        type: 'spring' as const,
                        stiffness: 200,
                      }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 z-20"
                    >
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {step.number}
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="relative pt-10 p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                    >
                      <div className="mb-6 flex justify-center">
                        <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} p-0.5`}>
                          <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center">
                            <Icon className="w-10 h-10 text-primary" />
                          </div>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold mb-3 text-center">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-center leading-relaxed">
                        {step.description}
                      </p>
                    </motion.div>

                    {index < steps.length - 1 && (
                      <div className="md:hidden flex justify-center my-6">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.2 + 0.5 }}
                          className="text-4xl text-primary/30"
                        >
                          ↓
                        </motion.div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
