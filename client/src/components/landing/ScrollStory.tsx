import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

interface ScrollStoryProps {
  title: string;
  description: string;
  stat?: string;
  statLabel?: string;
  imageUrl: string;
  imageAlt: string;
  reverse?: boolean;
}

export default function ScrollStory({
  title,
  description,
  stat,
  statLabel,
  imageUrl,
  imageAlt,
  reverse = false,
}: ScrollStoryProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !imageRef.current || !textRef.current) return;

    // Image parallax
    gsap.fromTo(
      imageRef.current,
      { y: 100, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "top 30%",
          scrub: 1,
        },
      }
    );

    // Text reveal
    gsap.fromTo(
      textRef.current,
      { x: reverse ? 100 : -100, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          end: "top 40%",
          scrub: 1,
        },
      }
    );

    // Continuous parallax on scroll
    gsap.to(imageRef.current, {
      y: -50,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 2,
      },
    });
  }, [reverse]);

  return (
    <div
      ref={sectionRef}
      className="relative min-h-screen flex items-center py-32 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      <div className="container relative z-10">
        <div
          className={`grid lg:grid-cols-2 gap-16 items-center ${
            reverse ? "lg:grid-flow-dense" : ""
          }`}
        >
          {/* Text Content */}
          <div
            ref={textRef}
            className={`space-y-8 ${reverse ? "lg:col-start-2" : ""}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-6xl md:text-7xl font-black tracking-tight mb-6">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {title}
                </span>
              </h2>

              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed mb-8">
                {description}
              </p>

              {stat && statLabel && (
                <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-sm">
                  <div className="text-5xl font-black text-emerald-400 mb-2">
                    {stat}
                  </div>
                  <div className="text-lg text-slate-400">{statLabel}</div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Image */}
          <div
            ref={imageRef}
            className={`relative ${reverse ? "lg:col-start-1 lg:row-start-1" : ""}`}
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 blur-3xl" />

              {/* Image */}
              <img
                src={imageUrl}
                alt={imageAlt}
                className="relative w-full h-full object-cover"
                loading="lazy"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
            </div>

            {/* Floating badge */}
            <motion.div
              className="absolute -top-6 -right-6 px-6 py-3 rounded-full bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/50"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              KI-gestützt
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
