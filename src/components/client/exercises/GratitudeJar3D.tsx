"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NoteState {
  mesh: THREE.Mesh;
  vy: number;
  targetY: number;
  bounced: boolean;
  settled: boolean;
}

const NOTE_COLORS = [0xf7c9dc, 0xd9c8f5, 0xfbe4a0];

function JarScene({ noteCount }: { noteCount: number }) {
  const wobbleRef = useRef<THREE.Group>(null!);
  const notesGroupRef = useRef<THREE.Group>(null!);
  const notesRef = useRef<NoteState[]>([]);
  const prevCount = useRef(0);

  useEffect(() => {
    for (let idx = prevCount.current; idx < noteCount; idx++) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.55, 0.06),
        new THREE.MeshStandardMaterial({ color: NOTE_COLORS[idx % 3], roughness: 0.6 })
      );
      const startX = (Math.random() - 0.5) * 1.2;
      mesh.position.set(startX, 5, (Math.random() - 0.5) * 1.2);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      notesGroupRef.current.add(mesh);
      notesRef.current.push({
        mesh,
        vy: 0,
        targetY: -1.9 + Math.min(idx, 10) * 0.32,
        bounced: false,
        settled: false,
      });
    }
    prevCount.current = Math.max(prevCount.current, noteCount);
  }, [noteCount]);

  useFrame(({ clock }) => {
    wobbleRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.15;

    notesRef.current.forEach((n) => {
      if (n.settled) return;
      n.vy += -0.014;
      n.mesh.position.y += n.vy;
      n.mesh.rotation.x += 0.02;
      n.mesh.rotation.z += 0.015;
      if (n.mesh.position.y <= n.targetY) {
        n.mesh.position.y = n.targetY;
        if (!n.bounced) {
          n.vy = -n.vy * 0.35;
          n.bounced = true;
        } else {
          n.vy = 0;
          n.settled = true;
        }
      }
    });
  });

  return (
    <group ref={wobbleRef}>
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <ambientLight intensity={0.55} />

      <mesh>
        <cylinderGeometry args={[2.2, 1.9, 4.4, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.22}
          roughness={0.05}
          metalness={0}
          transmission={0.5}
          thickness={1}
        />
      </mesh>

      <mesh position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.09, 16, 48]} />
        <meshStandardMaterial color="#d9628f" roughness={0.3} />
      </mesh>

      <mesh position={[0, -2.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.6, 40]} />
        <meshStandardMaterial color="#f0e6ea" roughness={1} />
      </mesh>

      <group ref={notesGroupRef} />
    </group>
  );
}

export default function GratitudeJar3D({ noteCount }: { noteCount: number }) {
  return (
    <Canvas camera={{ position: [0, 0.5, 9], fov: 38 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <JarScene noteCount={noteCount} />
    </Canvas>
  );
}
