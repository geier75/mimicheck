/**
 * Premium 3D Flow Diagram - WebGL 8K Ready
 * 
 * Features:
 * - 3D Glassmorphism Cards
 * - Particle Trail Animation
 * - Depth & Shadows
 * - Psychologische Trigger (Bewegung, Tiefe, Premium)
 * - Brand Colors (#21E6A1, #0F9BD8)
 * 
 * @author Cascade AI
 * @date 2025-11-15
 */

import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { CheckCircle } from "lucide-react";

// Custom Document Upload Icon - Premium Design
function DocumentUploadIcon({ size = 48, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
    >
      {/* Document Background */}
      <path 
        d="M16 8C16 5.79086 17.7909 4 20 4H36L48 16V56C48 58.2091 46.2091 60 44 60H20C17.7909 60 16 58.2091 16 56V8Z" 
        fill="rgba(255,255,255,0.1)"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Folded Corner */}
      <path 
        d="M36 4V12C36 14.2091 37.7909 16 40 16H48" 
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Document Lines */}
      <line x1="22" y1="24" x2="42" y2="24" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="22" y1="32" x2="38" y2="32" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="22" y1="40" x2="34" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/>
      
      {/* Upload Arrow Container */}
      <rect x="24" y="42" width="16" height="12" rx="3" fill={color} fillOpacity="0.3"/>
      
      {/* Upload Arrow */}
      <path 
        d="M32 54V44M32 44L27 49M32 44L37 49" 
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Custom AI Brain Icon - Premium Design
function AIBrainIcon({ size = 48, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
    >
      {/* Brain Outer Shape - Left Hemisphere */}
      <path 
        d="M32 12C22 12 14 20 14 30C14 35 16 39 19 42C17 44 16 47 16 50C16 54 19 56 22 56C24 56 26 55 27 53C28 55 30 56 32 56"
        fill="rgba(255,255,255,0.08)"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Brain Outer Shape - Right Hemisphere */}
      <path 
        d="M32 12C42 12 50 20 50 30C50 35 48 39 45 42C47 44 48 47 48 50C48 54 45 56 42 56C40 56 38 55 37 53C36 55 34 56 32 56"
        fill="rgba(255,255,255,0.08)"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Brain Center Line */}
      <path 
        d="M32 12V56"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 2"
        opacity="0.5"
      />
      {/* Brain Folds - Left */}
      <path 
        d="M20 24C23 22 26 24 28 22M18 32C22 30 26 33 30 30M20 40C24 38 27 41 30 38"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Brain Folds - Right */}
      <path 
        d="M44 24C41 22 38 24 36 22M46 32C42 30 38 33 34 30M44 40C40 38 37 41 34 38"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Neural Points - Static */}
      <circle cx="24" cy="28" r="2" fill={color} opacity="0.8"/>
      <circle cx="40" cy="28" r="2" fill={color} opacity="0.8"/>
      <circle cx="32" cy="36" r="2.5" fill={color} opacity="0.9"/>
      {/* AI Indicator - Static Ring */}
      <circle 
        cx="32" 
        cy="32" 
        r="22" 
        stroke={color}
        strokeWidth="1"
        fill="none"
        opacity="0.3"
        strokeDasharray="8 4"
      />
    </svg>
  );
}

// 3D Floating Icon Component
function FloatingIcon3D({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <Float
      speed={1.5}
      rotationIntensity={0.3}
      floatIntensity={0.5}
      position={[0, 0, 0]}
    >
      <Sphere args={[1, 64, 64]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Float>
  );
}

// Particle Trail Component
function ParticleTrail() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!particlesRef.current) return;

    // Create particles
    const particles = Array.from({ length: 20 }, (_, i) => {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: linear-gradient(135deg, #21E6A1, #0F9BD8);
        border-radius: 50%;
        opacity: 0;
        left: ${i * 5}%;
        top: 50%;
      `;
      particlesRef.current?.appendChild(particle);
      return particle;
    });

    // Animate particles
    gsap.to(particles, {
      opacity: 1,
      y: -20,
      duration: 2,
      stagger: 0.1,
      repeat: -1,
      ease: "power2.out",
    });

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, []);

  return <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />;
}

// Single Flow Step Component
interface FlowStepProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  delay: number;
  index: number;
}

function FlowStep({ icon, title, subtitle, color, delay, index }: FlowStepProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >

      {/* Glassmorphism Card */}
      <div
        className="relative p-8 rounded-3xl backdrop-blur-xl border-2 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
          borderColor: `${color}40`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.2), 0 0 80px ${color}20`,
        }}
      >
        {/* Glow Effect */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10"
          style={{
            background: `radial-gradient(circle at center, ${color}40, transparent 70%)`,
          }}
        />

        {/* Icon Container - Premium Design */}
        <div
          className="w-28 h-28 mx-auto mb-6 rounded-2xl flex items-center justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(145deg, ${color}25, ${color}08)`,
            boxShadow: `0 8px 32px ${color}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
            border: `1px solid ${color}30`,
          }}
        >
          {/* Static Glow Background */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 50% 30%, ${color}40, transparent 60%)`,
            }}
          />
          
          {/* Icon */}
          <div className="relative z-10" style={{ color }}>
            {icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-white mb-2 text-center">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="text-slate-400 text-center text-sm">
          {subtitle}
        </p>

        {/* Step Number */}
        <div
          className="absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}80)`,
            boxShadow: `0 4px 16px ${color}40`,
          }}
        >
          {index + 1}
        </div>
      </div>
    </motion.div>
  );
}

// Main Component
export default function FlowDiagram3D() {
  const steps = [
    {
      icon: <DocumentUploadIcon size={56} color="#21E6A1" />,
      title: "Upload",
      subtitle: "Dokumente hochladen",
      color: "#21E6A1",
    },
    {
      icon: <AIBrainIcon size={56} color="#0F9BD8" />,
      title: "KI-Analyse",
      subtitle: "Automatische Prüfung",
      color: "#0F9BD8",
    },
    {
      icon: <CheckCircle size={48} strokeWidth={2.5} />,
      title: "Bewilligt",
      subtitle: "Geld erhalten",
      color: "#06b6d4",
    },
  ];

  return (
    <div className="relative py-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 opacity-50" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(33, 230, 161, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(33, 230, 161, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <FlowStep
                {...step}
                delay={index * 0.2}
                index={index}
              />

              {/* Arrow Between Steps (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 1,
                      delay: index * 0.2 + 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 24H40M40 24L32 16M40 24L32 32"
                        stroke="url(#arrow-gradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient
                          id="arrow-gradient"
                          x1="8"
                          y1="24"
                          x2="40"
                          y2="24"
                        >
                          <stop offset="0%" stopColor="#21E6A1" />
                          <stop offset="100%" stopColor="#0F9BD8" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-xl text-slate-400">
            <span className="text-[#21E6A1] font-bold">Automatisch.</span>{" "}
            <span className="text-[#0F9BD8] font-bold">Sicher.</span>{" "}
            <span className="text-white font-bold">In 3 Minuten.</span>
          </p>
        </motion.div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
