/**
 * PREMIUM WebGL 3D Logo Hero Background
 * 
 * Features:
 * - 3D MimiCheck Logo (rotierend, floating)
 * - 5000+ Animated Particles
 * - Premium Glow & Lighting
 * - Interactive Mouse Tracking
 * - Smooth Animations
 * - Performance Optimized (60 FPS)
 * 
 * @author Cascade AI (Omega One)
 * @date 2025-11-14
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function WebGLLogoHero({ children, className = '', intensity = 1.0 }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);
  const logoRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // ========================================
    // SCENE SETUP
    // ========================================
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.0005);
    sceneRef.current = scene;

    // Camera Setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // ========================================
    // PARTICLE SYSTEM (5000 Particles)
    // ========================================
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000;
    
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    const velocities = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      
      // Spherical distribution
      const radius = 25 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Premium Color Palette: Green → Teal → Blue
      const colorT = i / particlesCount;
      if (colorT < 0.5) {
        // Green (#21E6A1) to Teal
        const t = colorT * 2;
        colors[i3] = 0.13 + t * 0.06;     // R
        colors[i3 + 1] = 0.90 - t * 0.29; // G
        colors[i3 + 2] = 0.63 + t * 0.22; // B
      } else {
        // Teal to Blue (#0F9BD8)
        const t = (colorT - 0.5) * 2;
        colors[i3] = 0.06 - t * 0.01;     // R
        colors[i3 + 1] = 0.61 - t * 0.01; // G
        colors[i3 + 2] = 0.85 - t * 0.01; // B
      }

      sizes[i] = Math.random() * 1.5 + 0.3;

      velocities[i3] = (Math.random() - 0.5) * 0.015;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.015;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.015;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.7 * intensity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    particlesRef.current = { mesh: particlesMesh, velocities, positions };

    // ========================================
    // 3D PREMIUM LOGO (Badge mit Checkmark)
    // ========================================
    
    const logoGroup = new THREE.Group();
    
    // Badge Background (abgerundetes Quadrat)
    const badgeShape = new THREE.Shape();
    const size = 8;
    const radius = 2;
    
    badgeShape.moveTo(-size + radius, -size);
    badgeShape.lineTo(size - radius, -size);
    badgeShape.quadraticCurveTo(size, -size, size, -size + radius);
    badgeShape.lineTo(size, size - radius);
    badgeShape.quadraticCurveTo(size, size, size - radius, size);
    badgeShape.lineTo(-size + radius, size);
    badgeShape.quadraticCurveTo(-size, size, -size, size - radius);
    badgeShape.lineTo(-size, -size + radius);
    badgeShape.quadraticCurveTo(-size, -size, -size + radius, -size);
    
    const extrudeSettings = {
      depth: 0.8,
      bevelEnabled: true,
      bevelThickness: 0.3,
      bevelSize: 0.2,
      bevelSegments: 8
    };
    
    const badgeGeometry = new THREE.ExtrudeGeometry(badgeShape, extrudeSettings);
    
    // Premium Gradient Material (Green → Teal)
    const badgeMaterial = new THREE.MeshPhongMaterial({
      color: 0x21E6A1,
      emissive: 0x0F9BD8,
      emissiveIntensity: 0.4,
      shininess: 120,
      specular: 0xffffff,
      flatShading: false
    });
    
    const badgeMesh = new THREE.Mesh(badgeGeometry, badgeMaterial);
    badgeMesh.castShadow = true;
    badgeMesh.receiveShadow = true;
    logoGroup.add(badgeMesh);
    
    // Checkmark (3D, breit, seriös)
    const checkGroup = new THREE.Group();
    
    // Kurzer Strich (links unten → mitte)
    const shortStrokeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4.5, 16);
    const checkMaterial = new THREE.MeshPhongMaterial({
      color: 0xF9FAFB,
      emissive: 0xF9FAFB,
      emissiveIntensity: 0.3,
      shininess: 100,
      specular: 0xffffff
    });
    
    const shortStroke = new THREE.Mesh(shortStrokeGeometry, checkMaterial);
    shortStroke.rotation.z = Math.PI / 4;
    shortStroke.position.set(-2, -1.5, 1);
    shortStroke.castShadow = true;
    checkGroup.add(shortStroke);
    
    // Langer Strich (mitte → rechts oben)
    const longStrokeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 16);
    const longStroke = new THREE.Mesh(longStrokeGeometry, checkMaterial);
    longStroke.rotation.z = -Math.PI / 4;
    longStroke.position.set(2, 1.5, 1);
    longStroke.castShadow = true;
    checkGroup.add(longStroke);
    
    // Kugeln an Enden (abgerundete Ecken)
    const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    
    const sphere1 = new THREE.Mesh(sphereGeometry, checkMaterial);
    sphere1.position.set(-4, -3.5, 1);
    sphere1.castShadow = true;
    checkGroup.add(sphere1);
    
    const sphere2 = new THREE.Mesh(sphereGeometry, checkMaterial);
    sphere2.position.set(0, 0, 1);
    sphere2.castShadow = true;
    checkGroup.add(sphere2);
    
    const sphere3 = new THREE.Mesh(sphereGeometry, checkMaterial);
    sphere3.position.set(4.5, 4.5, 1);
    sphere3.castShadow = true;
    checkGroup.add(sphere3);
    
    logoGroup.add(checkGroup);
    
    // Glühender Ring (Premium-Effekt)
    const ringGeometry = new THREE.TorusGeometry(10, 0.15, 16, 100);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0x21E6A1,
      emissive: 0x21E6A1,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    logoGroup.add(ring);
    
    // Logo positionieren
    logoGroup.position.set(0, 0, 0);
    logoGroup.scale.set(1, 1, 1);
    
    scene.add(logoGroup);
    logoRef.current = logoGroup;

    // ========================================
    // PREMIUM LIGHTING SETUP
    // ========================================
    
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Directional Light 1 (Green) - Main Light
    const light1 = new THREE.DirectionalLight(0x21E6A1, 2.5 * intensity);
    light1.position.set(15, 15, 15);
    light1.castShadow = true;
    light1.shadow.mapSize.width = 2048;
    light1.shadow.mapSize.height = 2048;
    scene.add(light1);

    // Directional Light 2 (Teal) - Fill Light
    const light2 = new THREE.DirectionalLight(0x0F9BD8, 2 * intensity);
    light2.position.set(-15, -15, -15);
    scene.add(light2);

    // Point Light 1 (Green) - Logo Glow
    const pointLight1 = new THREE.PointLight(0x21E6A1, 4 * intensity, 80);
    pointLight1.position.set(0, 0, 25);
    pointLight1.castShadow = true;
    scene.add(pointLight1);

    // Point Light 2 (Teal) - Animated Orbit
    const pointLight2 = new THREE.PointLight(0x0F9BD8, 3 * intensity, 80);
    pointLight2.position.set(0, 0, 20);
    scene.add(pointLight2);

    // Spot Light auf Logo
    const spotLight = new THREE.SpotLight(0x21E6A1, 3.5 * intensity);
    spotLight.position.set(0, 25, 25);
    spotLight.target = logoGroup;
    spotLight.angle = Math.PI / 5;
    spotLight.penumbra = 0.4;
    spotLight.castShadow = true;
    scene.add(spotLight);

    // ========================================
    // MOUSE INTERACTION
    // ========================================
    const handleMouseMove = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // ========================================
    // PREMIUM ANIMATION LOOP
    // ========================================
    const clock = new THREE.Clock();
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate Particles
      if (particlesRef.current) {
        const { mesh, velocities } = particlesRef.current;
        const posArray = mesh.geometry.attributes.position.array;

        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          
          posArray[i3] += velocities[i3];
          posArray[i3 + 1] += velocities[i3 + 1];
          posArray[i3 + 2] += velocities[i3 + 2];

          const distance = Math.sqrt(
            posArray[i3] ** 2 +
            posArray[i3 + 1] ** 2 +
            posArray[i3 + 2] ** 2
          );

          if (distance > 65) {
            posArray[i3] = (Math.random() - 0.5) * 8;
            posArray[i3 + 1] = (Math.random() - 0.5) * 8;
            posArray[i3 + 2] = (Math.random() - 0.5) * 8;
          }
        }

        mesh.geometry.attributes.position.needsUpdate = true;
        mesh.rotation.y = elapsedTime * 0.025;
        mesh.rotation.x = elapsedTime * 0.015;
      }

      // Animate Logo (Premium Motion)
      if (logoRef.current) {
        // Sanfte Rotation (Y-Achse)
        logoRef.current.rotation.y = elapsedTime * 0.25;
        
        // Leichte Wipp-Bewegung (X & Z)
        logoRef.current.rotation.x = Math.sin(elapsedTime * 0.4) * 0.15;
        logoRef.current.rotation.z = Math.cos(elapsedTime * 0.3) * 0.08;
        
        // Pulsierendes Glow (Scale)
        const scale = 1.0 + Math.sin(elapsedTime * 1.5) * 0.08;
        logoRef.current.scale.set(scale, scale, scale);
        
        // Floating (Auf/Ab-Bewegung)
        logoRef.current.position.y = Math.sin(elapsedTime * 0.6) * 2.5;
        
        // Mouse Interaction (Subtle)
        logoRef.current.rotation.x += mouseRef.current.y * 0.02;
        logoRef.current.rotation.y += mouseRef.current.x * 0.02;
      }

      // Animate Point Light Orbit
      pointLight2.position.x = Math.cos(elapsedTime * 0.4) * 35;
      pointLight2.position.z = Math.sin(elapsedTime * 0.4) * 35;

      // Camera follows mouse (very subtle)
      camera.position.x += (mouseRef.current.x * 6 - camera.position.x) * 0.04;
      camera.position.y += (mouseRef.current.y * 6 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      // Render
      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    // ========================================
    // RESPONSIVE RESIZE
    // ========================================
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // ========================================
    // CLEANUP
    // ========================================
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);

      // Dispose geometries
      particlesGeometry.dispose();
      badgeGeometry.dispose();
      shortStrokeGeometry.dispose();
      longStrokeGeometry.dispose();
      sphereGeometry.dispose();
      ringGeometry.dispose();

      // Dispose materials
      particlesMaterial.dispose();
      badgeMaterial.dispose();
      checkMaterial.dispose();
      ringMaterial.dispose();

      // Dispose renderer
      renderer.dispose();

      // Clear scene
      scene.clear();
    };
  }, [intensity]);

  return (
    <div className={`relative ${className}`}>
      {/* WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10"
        style={{
          opacity: isLoaded ? 0.75 : 0,
          transition: 'opacity 1.8s ease-in',
          pointerEvents: 'none'
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
