/**
 * Trust Badges Section
 * 
 * Features:
 * - DSGVO, SSL, Made in Germany, TÜV Badges
 * - Responsive Layout
 * - Premium Design
 * 
 * @author Cascade AI (Omega One)
 * @date 2025-11-14
 */

import { Shield, Lock, MapPin, Award, CheckCircle } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: <Shield className="w-5 h-5 text-[#21E6A1]" />,
      text: "DSGVO-konform",
      description: "100% datenschutzkonform"
    },
    {
      icon: <Lock className="w-5 h-5 text-[#21E6A1]" />,
      text: "SSL-verschlüsselt",
      description: "Sichere Datenübertragung"
    },
    {
      icon: <MapPin className="w-5 h-5 text-[#21E6A1]" />,
      text: "Made in Germany",
      description: "Entwickelt in Deutschland"
    },
    {
      icon: <Award className="w-5 h-5 text-[#21E6A1]" />,
      text: "TÜV-geprüft",
      description: "Qualität garantiert"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-[#21E6A1]" />,
      text: "Kostenlos testen",
      description: "Keine Kreditkarte nötig"
    }
  ];

  return (
    <section className="py-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-y border-slate-200/60 dark:border-slate-700/60">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-12">
          {badges.map((badge, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 group cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-[#21E6A1]/10 dark:bg-[#21E6A1]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#21E6A1]/20 dark:group-hover:bg-[#21E6A1]/30 transition-colors duration-300">
                {badge.icon}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {badge.text}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {badge.description}
                </div>
              </div>
              <div className="sm:hidden text-sm font-semibold text-slate-900 dark:text-white">
                {badge.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
