/**
 * MimiCheck Logo Component (Wiederverwendbar)
 * 
 * Varianten:
 * - icon: Nur Icon (Badge mit Checkmark)
 * - full: Icon + Wortmarke
 * - animated: Mit Framer Motion Animationen
 * 
 * @author Cascade AI (Omega One)
 * @date 2025-11-14
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Logo({ 
  variant = 'full',  // 'icon' | 'full'
  size = 'md',       // 'sm' | 'md' | 'lg' | 'xl'
  animated = true,
  link = '/',
  className = ''
}) {
  
  // Size Classes
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };

  // Logo Source
  const logoSrc = variant === 'icon' 
    ? '/assets/logos/mimicheck-icon.svg'
    : '/assets/logos/mimicheck-logo.svg';

  // Animation Variants
  const logoVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95 
    }
  };

  const LogoImage = animated ? motion.img : 'img';

  const logoProps = animated ? {
    src: logoSrc,
    alt: 'MimiCheck Logo',
    className: `${sizeClasses[size]} ${className}`,
    variants: logoVariants,
    initial: 'initial',
    animate: 'animate',
    whileHover: 'hover',
    whileTap: 'tap'
  } : {
    src: logoSrc,
    alt: 'MimiCheck Logo',
    className: `${sizeClasses[size]} ${className}`
  };

  if (link) {
    return (
      <Link to={link} className="inline-block">
        <LogoImage {...logoProps} />
      </Link>
    );
  }

  return <LogoImage {...logoProps} />;
}

// Icon-only Variant (Shortcut)
export function LogoIcon({ size = 'md', animated = true, link, className = '' }) {
  return (
    <Logo 
      variant="icon" 
      size={size} 
      animated={animated} 
      link={link}
      className={className}
    />
  );
}

// Loading Spinner Variant
export function LogoSpinner({ size = 'md', className = '' }) {
  return (
    <motion.img
      src="/assets/logos/mimicheck-icon.svg"
      alt="Loading..."
      className={`${size === 'sm' ? 'h-8' : size === 'md' ? 'h-12' : size === 'lg' ? 'h-16' : 'h-20'} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        ease: 'linear' 
      }}
    />
  );
}

// Success Checkmark Animation
export function LogoSuccess({ size = 'md', onComplete, className = '' }) {
  return (
    <motion.img
      src="/assets/logos/mimicheck-icon.svg"
      alt="Success!"
      className={`${size === 'sm' ? 'h-12' : size === 'md' ? 'h-16' : size === 'lg' ? 'h-20' : 'h-24'} ${className}`}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 200, 
        damping: 15,
        duration: 0.6
      }}
      onAnimationComplete={onComplete}
    />
  );
}
