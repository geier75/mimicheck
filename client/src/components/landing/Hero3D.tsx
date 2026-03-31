import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

// Floating particles around the logo
function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 50;

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const radius = 3 + Math.random() * 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const t = Math.random();
    colors[i * 3] = 0.5 + t * 0.3;
    colors[i * 3 + 1] = 0.8 + t * 0.2;
    colors[i * 3 + 2] = 0.9 - t * 0.4;
  }

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Checkmark() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
      meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={meshRef}>
        <mesh>
          <torusGeometry args={[1.2, 0.15, 16, 64]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        <group position={[-0.3, -0.2, 0]} rotation={[0, 0, -0.5]}>
          <mesh>
            <boxGeometry args={[0.2, 0.8, 0.2]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={0.6}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>

        <group position={[0.3, 0.1, 0]} rotation={[0.0, 0, 0.8]}>
          <mesh>
            <boxGeometry args={[0.2, 1.2, 0.2]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={0.6}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>

        <mesh position={[0, 0, -0.5]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={0.1}
          />
        </mesh>
      </group>
    </Float>
  );
}

function Scene({ mousePosition }: { mousePosition?: { x: number; y: number } }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (cameraRef.current && mousePosition) {
      cameraRef.current.position.x = mousePosition.x;
      cameraRef.current.position.y = mousePosition.y;
      cameraRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 6]} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
      
      <Checkmark />
      <Particles />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </>
  );
}

interface Hero3DProps {
  reducedMotion?: boolean;
}

export default function Hero3D({ reducedMotion = false }: Hero3DProps) {
  const [isClient, setIsClient] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x: x * 0.5, y: y * 0.5 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

  if (!isClient) {
    return (
      <div className="w-full h-[600px] rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading 3D...</div>
      </div>
    );
  }

  if (reducedMotion) {
    return (
      <div className="w-full h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
        <img
          src="/mimicheck-logo-hero.png"
          alt="MiMiCheck Logo"
          className="max-w-full max-h-full object-contain p-8"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-background via-primary/5 to-purple-500/10 shadow-2xl">
      <Canvas
        dpr={[1, 1.5]}
        frameloop="demand"
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Scene mousePosition={mousePosition} />
      </Canvas>
    </div>
  );
}
