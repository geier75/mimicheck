import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AsymmetricSectionProps {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  stats?: Array<{ value: string; label: string }>;
}

export default function AsymmetricSection({
  title,
  description,
  imageUrl,
  imageAlt,
  stats,
}: AsymmetricSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !imageRef.current) return;

    // Image parallax with rotation
    gsap.fromTo(
      imageRef.current,
      { y: 150, rotate: -5, opacity: 0 },
      {
        y: 0,
        rotate: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "top 20%",
          scrub: 1,
        },
      }
    );
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative min-h-screen flex items-center py-32 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
    >
      {/* Grain Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      <div className="container relative z-10">
        {/* Asymmetric Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Text Content - Takes 7 columns, offset */}
          <div className="lg:col-span-7 lg:col-start-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              {/* Massive Typography */}
              <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-none mb-8">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {title}
                </span>
              </h2>

              <p className="text-2xl md:text-3xl text-slate-300 leading-relaxed max-w-2xl">
                {description}
              </p>

              {/* Stats Grid */}
              {stats && stats.length > 0 && (
                <div className="grid grid-cols-2 gap-6 mt-12 max-w-xl">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-sm"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                    >
                      <div className="text-4xl font-black text-emerald-400 mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-slate-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Image - Takes 5 columns, overlaps */}
          <div
            ref={imageRef}
            className="lg:col-span-5 lg:col-start-8 relative"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/30 to-teal-500/30 blur-3xl rounded-3xl" />

              {/* Image with asymmetric clip-path */}
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden">
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  className="w-full h-full object-cover"
                  style={{
                    clipPath: "polygon(0 5%, 100% 0, 100% 95%, 0 100%)",
                  }}
                  loading="lazy"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>

              {/* Floating element */}
              <motion.div
                className="absolute -bottom-8 -left-8 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-2xl shadow-emerald-500/50"
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ✓ KI-geprüft
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
