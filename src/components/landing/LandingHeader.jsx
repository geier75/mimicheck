/**
 * Landing Page Header mit Premium MimiCheck Logo
 * 
 * Features:
 * - Sticky Header mit Glassmorphism
 * - Premium Logo (animiert)
 * - CTA Button
 * - Responsive
 * 
 * @author Cascade AI (Omega One)
 * @date 2025-11-14
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';

export default function LandingHeader({ onCTAClick }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg border-b border-slate-200/60 dark:border-slate-700/60'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Logo 
            variant="full" 
            size="md" 
            animated={true}
            link="/"
            className="transition-all duration-300"
          />

          {/* CTA Button */}
          <Button
            onClick={onCTAClick}
            className="group relative px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-[#21E6A1] to-[#0F9BD8] hover:from-[#1BD494] hover:to-[#0A8BC4] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              Kostenlos starten
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#21E6A1] to-[#0F9BD8] blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
