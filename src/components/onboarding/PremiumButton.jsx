/**
 * REFACTOR: PremiumButton Komponente (DRY Principle)
 * 
 * Wiederverwendbarer Premium Button mit Gradient & Hover Effects
 */

import { motion } from 'framer-motion';

export default function PremiumButton({ 
  children, 
  onClick, 
  disabled = false,
  variant = 'primary', // primary | secondary
  size = 'md', // sm | md | lg
  className = '',
  ...props 
}) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4'
  };

  const variantClasses = {
    primary: disabled 
      ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-2xl hover:shadow-purple-500/50',
    secondary: 'border-2 border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 hover:border-purple-500'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-2xl font-semibold text-white 
        flex items-center gap-2 
        transition-all shadow-lg
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
}
