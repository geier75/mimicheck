/**
 * REFACTOR: StepCard Komponente (DRY Principle)
 * 
 * Wiederverwendbare Premium Step Card mit Glassmorphism & Shimmer
 */

import { motion } from 'framer-motion';

export default function StepCard({ 
  children, 
  icon: Icon, 
  title, 
  iconGradient = 'from-purple-500 to-pink-500',
  stepKey,
  onExit 
}) {
  return (
    <motion.section
      key={stepKey}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      aria-labelledby={`${stepKey}-title`}
      data-testid="step-card"
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden group"
    >
      {/* Shimmer Effect */}
      <div className="shimmer-effect absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative">
        <div className={`w-12 h-12 bg-gradient-to-br ${iconGradient} rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h2 id={`${stepKey}-title`} className="text-2xl font-bold text-slate-800 dark:text-white">
          {title}
        </h2>
      </div>

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </motion.section>
  );
}
