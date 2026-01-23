"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 500 }) {
  const mesh = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Color (gold tones)
      const goldVariation = Math.random() * 0.3;
      colors[i * 3] = 0.8 + goldVariation * 0.2; // R
      colors[i * 3 + 1] = 0.65 + goldVariation * 0.15; // G
      colors[i * 3 + 2] = 0.2 + goldVariation * 0.1; // B
    }

    return { positions, colors };
  }, [count]);

  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.setAttribute(
        "position",
        new THREE.BufferAttribute(particles.positions, 3)
      );
      geometryRef.current.setAttribute(
        "color",
        new THREE.BufferAttribute(particles.colors, 3)
      );
    }
  }, [particles]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.02;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry ref={geometryRef} />
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

function FloatingScale() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <torusGeometry args={[1.5, 0.05, 16, 100]} />
      <meshStandardMaterial
        color="#c9a227"
        emissive="#c9a227"
        emissiveIntensity={0.3}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

export function ParticlesBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c9a227" />
        <Particles count={300} />
        <FloatingScale />
      </Canvas>
    </div>
  );
}
