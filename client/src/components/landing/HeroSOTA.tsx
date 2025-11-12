import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

// Flow Diagram Component
function FlowDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Animate arrows
    gsap.to(".flow-arrow", {
      x: 10,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    // Animate dots
    gsap.to(".flow-dot", {
      scale: 1.2,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      stagger: 0.3,
    });
  }, []);

  return (
    <svg
      ref={svgRef}
      className="w-full max-w-md"
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Upload */}
      <g>
        <circle
          className="flow-dot"
          cx="50"
          cy="50"
          r="30"
          fill="url(#grad1)"
          opacity="0.2"
        />
        <circle cx="50" cy="50" r="20" fill="url(#grad1)" />
        <text x="50" y="55" textAnchor="middle" fill="white" fontSize="12">
          📄
        </text>
        <text x="50" y="100" textAnchor="middle" fill="white" fontSize="14">
          Upload
        </text>
      </g>

      {/* Arrow 1 */}
      <g className="flow-arrow">
        <path
          d="M 90 50 L 140 50"
          stroke="url(#grad1)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 135 45 L 140 50 L 135 55"
          stroke="url(#grad1)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* AI Processing */}
      <g>
        <circle
          className="flow-dot"
          cx="200"
          cy="50"
          r="35"
          fill="url(#grad2)"
          opacity="0.2"
        />
        <circle cx="200" cy="50" r="25" fill="url(#grad2)" />
        <text x="200" y="55" textAnchor="middle" fill="white" fontSize="12">
          🤖
        </text>
        <text x="200" y="100" textAnchor="middle" fill="white" fontSize="14">
          KI-Analyse
        </text>
      </g>

      {/* Arrow 2 */}
      <g className="flow-arrow">
        <path
          d="M 240 50 L 290 50"
          stroke="url(#grad2)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 285 45 L 290 50 L 285 55"
          stroke="url(#grad2)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Approval */}
      <g>
        <circle
          className="flow-dot"
          cx="350"
          cy="50"
          r="30"
          fill="url(#grad3)"
          opacity="0.2"
        />
        <circle cx="350" cy="50" r="20" fill="url(#grad3)" />
        <text x="350" y="55" textAnchor="middle" fill="white" fontSize="12">
          ✓
        </text>
        <text x="350" y="100" textAnchor="middle" fill="white" fontSize="14">
          Bewilligt
        </text>
      </g>

      {/* Gradients */}
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
    </svg>
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

      {/* 3D Background - Lazy Loaded with WebGL Fallback */}
      {load3D && webGLSupported ? (
        <div className="absolute inset-0 opacity-30">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            </div>
          }>
            <Canvas
              camera={{ position: [0, 0, 8], fov: 50 }}
              dpr={[1, 1.5]}
              frameloop="demand"
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              <Checkmark3D />
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={1}
              />
            </Canvas>
          </Suspense>
        </div>
      ) : load3D && !webGLSupported ? (
        // Static Fallback for devices without WebGL
        <div className="absolute inset-0 opacity-30 flex items-center justify-center">
          <div className="relative">
            {/* Static Checkmark SVG */}
            <svg width="200" height="200" viewBox="0 0 200 200" className="animate-pulse">
              <defs>
                <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="80" fill="none" stroke="url(#checkGrad)" strokeWidth="8" opacity="0.3" />
              <path
                d="M 60 100 L 85 125 L 140 70"
                fill="none"
                stroke="url(#checkGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      ) : null}

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

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12">
            MiMiCheck analysiert deine Dokumente mit KI und erstellt deinen
            Förderantrag automatisch. EU AI Act konform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/50"
            >
              <Link href="/auth">
                Jetzt kostenlos starten
                <span className="ml-2">→</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/10"
            >
              <Link href="/contact">Demo anfragen</Link>
            </Button>
          </div>

          {/* Flow Diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex justify-center"
          >
            <FlowDiagram />
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
