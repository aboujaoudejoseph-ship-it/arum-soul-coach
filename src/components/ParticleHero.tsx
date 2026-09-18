"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 2600;

function HeartParticles() {
  const points = useRef<THREE.Points>(null!);
  const mouse = useRef({ x: 0, y: 0 });
  const rot = useRef({ x: 0, y: 0 });

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const colorA = new THREE.Color("#e783aa");
    const colorB = new THREE.Color("#a48ee1");

    for (let i = 0; i < COUNT; i++) {
      const t = Math.random() * Math.PI * 2;
      const scale = 0.62 + Math.random() * 0.18;
      let hx = 16 * Math.pow(Math.sin(t), 3);
      let hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      hx *= scale;
      hy *= scale;
      const depth = (Math.random() - 0.5) * 6;
      const jitter = (Math.random() - 0.5) * 1.4;
      positions[i * 3] = hx + jitter;
      positions[i * 3 + 1] = hy + jitter;
      positions[i * 3 + 2] = depth;

      const c = colorA.clone().lerp(colorB, (hy + 13) / 26 + Math.random() * 0.15);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, []);

  useFrame(({ clock, pointer }) => {
    mouse.current.x = pointer.x;
    mouse.current.y = pointer.y;
    const t = clock.getElapsedTime();
    rot.current.y += (mouse.current.x * 0.5 - rot.current.y) * 0.04;
    rot.current.x += (-mouse.current.y * 0.3 - rot.current.x) * 0.04;
    points.current.rotation.y = Math.PI + rot.current.y + Math.sin(t * 0.5) * 0.05;
    points.current.rotation.x = rot.current.x;
    points.current.position.y = Math.sin(t) * 0.3;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.22} vertexColors transparent opacity={0.88} depthWrite={false} />
    </points>
  );
}

export default function ParticleHero() {
  return (
    <Canvas
      camera={{ position: [0, 0, 26], fov: 50 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      className="!absolute inset-0"
    >
      <HeartParticles />
    </Canvas>
  );
}
