import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FlowDiagram3D from "./FlowDiagram3D";

gsap.registerPlugin(ScrollTrigger);

// 3D Checkmark Component
function Checkmark3D() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh>
        <torusGeometry args={[2, 0.3, 16, 100]} />
        <meshStandardMaterial
          color="#10b981"
          metalness={0.8}
          roughness={0.2}
          emissive="#10b981"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[-0.5, -0.5, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[1.5, 0.4, 0.4]} />
        <meshStandardMaterial
          color="#10b981"
          metalness={0.8}
          roughness={0.2}
          emissive="#10b981"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[1, 0.5, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[3, 0.4, 0.4]} />
        <meshStandardMaterial
          color="#10b981"
          metalness={0.8}
          roughness={0.2}
          emissive="#10b981"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

// Typing Effect Component
function TypingHeadline() {
  const benefits = ["Wohngeld", "Kindergeld", "BAföG", "Elterngeld"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentBenefit = benefits[currentIndex];
    const typingSpeed = isDeleting ? 50 : 100;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (displayText.length < currentBenefit.length) {
          setDisplayText(currentBenefit.slice(0, displayText.length + 1));
        } else {
          // Wait before deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % benefits.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex]);

  return (
    <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-6">
      <span className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 bg-clip-text text-transparent">
        {displayText}
      </span>
      <span className="animate-pulse">|</span>
      <br />
      <span className="text-white">in 3 Minuten</span>
    </h1>
  );
}

// Typing Subheadline Component - Wiederholt sich
function TypingSubheadline() {
  const text = "MiMiCheck scannt deine Dokumente blitzschnell und zeigt dir sofort, auf welche Fördergelder du Anspruch hast – klar, einfach und ohne Papierstress.";
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typingSpeed = isDeleting ? 20 : 30;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Tippen
        if (displayText.length < text.length) {
          setDisplayText(text.slice(0, displayText.length + 1));
        } else {
          // Warten bevor löschen
          setTimeout(() => setIsDeleting(true), 3000);
        }
      } else {
        // Löschen
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting]);

  return (
    <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 min-h-[4rem]">
      {displayText}
      <span className="animate-pulse">|</span>
    </p>
  );
}

// WebGL Detection
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

export default function HeroSOTA() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [load3D, setLoad3D] = useState(false);
  const [webGLSupported] = useState(isWebGLAvailable());

  // Lazy load 3D only when hero is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoad3D(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;

    // GSAP ScrollTrigger for parallax
    gsap.to(".hero-content", {
      y: 100,
      opacity: 0.5,
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
    >
      {/* Grain Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />


      {/* Hero Content */}
      <div className="hero-content relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Pre-Headline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 text-sm font-medium">
              KI-gestützte Förderanträge
            </span>
          </div>

          {/* Typing Headline */}
          <TypingHeadline />

          {/* Subheadline mit Typewriter */}
          <TypingSubheadline />

          {/* CTA Button - Scrollt zur Anmeldung */}
          <div className="flex justify-center mb-16">
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/50"
            >
              <a href="#auth" onClick={(e) => {
                e.preventDefault();
                document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Jetzt kostenlos starten
                <span className="ml-2">→</span>
              </a>
            </Button>
          </div>

          {/* Premium 3D Flow Diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <FlowDiagram3D />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
      >
        <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-emerald-500 rounded-full mt-2 animate-bounce" />
        </div>
      </motion.div>
    </div>
  );
}
