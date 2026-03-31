/**
 * Success Animation mit MimiCheck Logo
 * 
 * Verwendung:
 * - Nach erfolgreicher Aktion (Upload, Submit, etc.)
 * - Zeigt animiertes Logo mit Checkmark
 * - Optional: Konfetti-Effekt
 * 
 * @author Cascade AI (Omega One)
 * @date 2025-11-14
 */

import { motion } from 'framer-motion';
import { LogoSuccess } from '@/components/ui/Logo';
import { CheckCircle } from 'lucide-react';

export default function SuccessAnimation({ 
  title = 'Erfolgreich!',
  message = 'Ihre Aktion wurde erfolgreich abgeschlossen.',
  onComplete,
  showConfetti = false
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6 p-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo Success Animation */}
      <LogoSuccess 
        size="lg" 
        onComplete={onComplete}
      />

      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#21E6A1] to-[#0F9BD8] flex items-center justify-center shadow-lg">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-2xl font-bold text-slate-900 dark:text-white"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {title}
      </motion.h3>

      {/* Message */}
      <motion.p
        className="text-center text-slate-600 dark:text-slate-300 max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {message}
      </motion.p>

      {/* Confetti Effect (optional) */}
      {showConfetti && <ConfettiEffect />}
    </motion.div>
  );
}

// Simple Confetti Effect
function ConfettiEffect() {
  const confettiColors = ['#21E6A1', '#0F9BD8', '#10B981', '#3B82F6'];
  const confettiCount = 50;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: confettiCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: confettiColors[i % confettiColors.length],
            left: `${Math.random() * 100}%`,
            top: '-10%'
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, Math.random() * 720],
            opacity: [1, 0]
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}

// Inline Success Badge (für kleine Erfolgs-Meldungen)
export function SuccessBadge({ message, className = '' }) {
  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#21E6A1]/10 to-[#0F9BD8]/10 border border-[#21E6A1]/20 ${className}`}
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <CheckCircle className="w-4 h-4 text-[#21E6A1]" />
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {message}
      </span>
    </motion.div>
  );
}
