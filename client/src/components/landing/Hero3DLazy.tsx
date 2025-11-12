import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";
import { Suspense } from "react";

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

// Fallback Loading Component
function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-32 h-32 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
    </div>
  );
}

// Lazy-loaded 3D Canvas
export default function Hero3DLazy() {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-96 pointer-events-none">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          dpr={[1, 1.5]}
          frameloop="demand"
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#14b8a6" />
          <Checkmark3D />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={2}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
