'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ── detect mobile ── */
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    setMobile(window.innerWidth < 768);
  }, []);
  return mobile;
}

/* ── single floating shape ── */
interface ShapeProps {
  position: [number, number, number];
  type: 'sphere' | 'torus' | 'icosahedron';
  scale: number;
  wireframe: boolean;
  color: string;
  speed: number;
  rotationSpeed: number;
}

function FloatingShape({ position, type, scale, wireframe, color, speed, rotationSpeed }: ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const mouse = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // gentle float
    meshRef.current.position.y = position[1] + Math.sin(t * speed) * 0.5;
    meshRef.current.position.x = position[0] + Math.sin(t * speed * 0.7) * 0.2;

    // rotation
    meshRef.current.rotation.x += rotationSpeed * 0.003;
    meshRef.current.rotation.y += rotationSpeed * 0.005;

    // subtle mouse influence
    meshRef.current.position.x += mouse.current.x * 0.05 * (viewport.width / 10);
    meshRef.current.position.y += mouse.current.y * 0.03 * (viewport.height / 10);
  });

  const geometry = useMemo(() => {
    switch (type) {
      case 'sphere':
        return <sphereGeometry args={[1, 32, 32]} />;
      case 'torus':
        return <torusGeometry args={[1, 0.35, 16, 32]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[1, 0]} />;
    }
  }, [type]);

  return (
    <Float speed={speed * 0.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometry}
        {wireframe ? (
          <meshStandardMaterial
            color={color}
            wireframe
            transparent
            opacity={0.25}
          />
        ) : (
          <MeshDistortMaterial
            color={color}
            transparent
            opacity={0.12}
            roughness={0.6}
            metalness={0.3}
            distort={0.15}
            speed={1.5}
          />
        )}
      </mesh>
    </Float>
  );
}

/* ── scene with all shapes ── */
function Scene({ isMobile }: { isMobile: boolean }) {
  const shapes = useMemo(() => {
    const count = isMobile ? 8 : 18;
    const types: ShapeProps['type'][] = ['sphere', 'torus', 'icosahedron'];
    const colors = ['#4B8A6C', '#4B8A6C', '#4B8A6C', '#B89B4A', '#6BA88A'];

    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8 - 2,
      ] as [number, number, number],
      type: types[i % types.length],
      scale: 0.15 + Math.random() * 0.35,
      wireframe: i % 3 === 0,
      color: colors[i % colors.length],
      speed: 0.3 + Math.random() * 0.8,
      rotationSpeed: 0.5 + Math.random() * 1.5,
    }));
  }, [isMobile]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} color="#E7DDC6" />
      <pointLight position={[5, 5, 5]} intensity={0.6} color="#B89B4A" />
      <pointLight position={[-5, -3, 3]} intensity={0.3} color="#4B8A6C" />

      {/* Fog for depth */}
      <fog attach="fog" args={['#0E3529', 8, 20]} />

      {/* Shapes */}
      {shapes.map((props, i) => (
        <FloatingShape key={i} {...props} />
      ))}
    </>
  );
}

/* ── exported component ── */
export default function ParticleField() {
  const isMobile = useIsMobile();

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
