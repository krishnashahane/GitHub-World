"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface CommitEvent {
  id: string;
  lat: number;
  lng: number;
  username: string;
  repo: string;
  message: string;
  language: string | null;
  timestamp: number;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  PHP: "#4F5D95",
  C: "#555555",
  "C#": "#178600",
  Dart: "#00B4AB",
  Shell: "#89e051",
};

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        color="#0d1117"
        wireframe={false}
        transparent
        opacity={0.9}
      />
      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[2.005, 32, 32]} />
        <meshBasicMaterial color="#1a2332" wireframe transparent opacity={0.4} />
      </mesh>
      {/* Equator and meridians */}
      {[0, 30, 60, -30, -60].map((lat) => (
        <mesh key={`lat-${lat}`} rotation={[0, 0, (lat * Math.PI) / 180]}>
          <torusGeometry args={[2 * Math.cos((lat * Math.PI) / 180), 0.003, 4, 64]} />
          <meshBasicMaterial color="#2a3a4a" transparent opacity={0.3} />
        </mesh>
      ))}
      {/* Continent outlines (simplified dots) */}
      <ContinentDots />
    </mesh>
  );
}

function ContinentDots() {
  const points = useMemo(() => {
    // Simplified world outline as dots
    const coastline = [
      // North America
      { lat: 49, lng: -125 }, { lat: 48, lng: -123 }, { lat: 45, lng: -124 },
      { lat: 42, lng: -124 }, { lat: 38, lng: -123 }, { lat: 34, lng: -118 },
      { lat: 32, lng: -117 }, { lat: 25, lng: -110 }, { lat: 20, lng: -105 },
      { lat: 30, lng: -90 }, { lat: 25, lng: -80 }, { lat: 30, lng: -81 },
      { lat: 35, lng: -75 }, { lat: 40, lng: -74 }, { lat: 42, lng: -70 },
      { lat: 45, lng: -67 }, { lat: 47, lng: -68 }, { lat: 50, lng: -60 },
      { lat: 55, lng: -60 }, { lat: 60, lng: -65 }, { lat: 65, lng: -65 },
      // Europe
      { lat: 37, lng: -9 }, { lat: 40, lng: -4 }, { lat: 43, lng: 3 },
      { lat: 44, lng: 8 }, { lat: 46, lng: 13 }, { lat: 51, lng: 4 },
      { lat: 53, lng: 8 }, { lat: 56, lng: 10 }, { lat: 60, lng: 11 },
      { lat: 63, lng: 10 }, { lat: 60, lng: 25 }, { lat: 55, lng: 21 },
      // Asia
      { lat: 42, lng: 27 }, { lat: 40, lng: 44 }, { lat: 35, lng: 51 },
      { lat: 25, lng: 57 }, { lat: 20, lng: 73 }, { lat: 23, lng: 87 },
      { lat: 22, lng: 91 }, { lat: 15, lng: 100 }, { lat: 10, lng: 106 },
      { lat: 20, lng: 110 }, { lat: 30, lng: 122 }, { lat: 35, lng: 130 },
      { lat: 38, lng: 140 }, { lat: 43, lng: 145 },
      // Africa
      { lat: 35, lng: -5 }, { lat: 30, lng: 10 }, { lat: 15, lng: -17 },
      { lat: 5, lng: 10 }, { lat: 0, lng: 42 }, { lat: -10, lng: 40 },
      { lat: -25, lng: 35 }, { lat: -34, lng: 18 }, { lat: -15, lng: 12 },
      // South America
      { lat: 10, lng: -67 }, { lat: 5, lng: -52 }, { lat: -3, lng: -40 },
      { lat: -10, lng: -37 }, { lat: -23, lng: -43 }, { lat: -34, lng: -58 },
      { lat: -40, lng: -72 }, { lat: -33, lng: -71 }, { lat: -20, lng: -70 },
      { lat: -5, lng: -81 },
      // Australia
      { lat: -12, lng: 131 }, { lat: -20, lng: 148 }, { lat: -28, lng: 153 },
      { lat: -34, lng: 151 }, { lat: -38, lng: 145 }, { lat: -35, lng: 117 },
      { lat: -25, lng: 113 }, { lat: -15, lng: 129 },
      // India
      { lat: 28, lng: 77 }, { lat: 19, lng: 73 }, { lat: 13, lng: 80 },
      { lat: 8, lng: 77 }, { lat: 15, lng: 74 }, { lat: 23, lng: 69 },
    ];

    return coastline.map((p) => latLngToVector3(p.lat, p.lng, 2.01));
  }, []);

  return (
    <>
      {points.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.015, 4, 4]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
}

function CommitBeams({ commits }: { commits: CommitEvent[] }) {
  const groupRef = useRef<THREE.Group>(null);

  // Only show recent commits (last 30 seconds)
  const recentCommits = useMemo(
    () => commits.filter((c) => Date.now() - c.timestamp < 30000).slice(0, 50),
    [commits]
  );

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        const age = (Date.now() - (child.userData.timestamp ?? 0)) / 1000;
        const opacity = Math.max(0, 1 - age / 30);
        if (child.material instanceof THREE.MeshBasicMaterial) {
          child.material.opacity = opacity;
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {recentCommits.map((commit) => {
        const pos = latLngToVector3(commit.lat, commit.lng, 2.02);
        const color = LANGUAGE_COLORS[commit.language ?? ""] ?? "#4ade80";
        const age = (Date.now() - commit.timestamp) / 1000;
        const scale = Math.max(0.3, 1 - age / 30);

        return (
          <group key={commit.id} position={pos}>
            {/* Pulse dot */}
            <mesh userData={{ timestamp: commit.timestamp }}>
              <sphereGeometry args={[0.02 * scale, 8, 8]} />
              <meshBasicMaterial color={color} transparent opacity={0.8} />
            </mesh>
            {/* Beam shooting up */}
            <mesh
              position={pos.clone().normalize().multiplyScalar(0.1 * scale)}
              userData={{ timestamp: commit.timestamp }}
            >
              <cylinderGeometry args={[0.002, 0.008, 0.2 * scale, 4]} />
              <meshBasicMaterial color={color} transparent opacity={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[2.15, 64, 64]} />
      <meshBasicMaterial
        color="#4ade80"
        transparent
        opacity={0.03}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

export default function GlobeCanvas({ commits }: { commits: CommitEvent[] }) {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 45 }}
      style={{ background: "#0d0d0f" }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} />
      <pointLight position={[-5, -3, -5]} intensity={0.3} color="#4ade80" />

      <Globe />
      <CommitBeams commits={commits} />
      <Atmosphere />

      {/* Stars background */}
      <mesh>
        <sphereGeometry args={[50, 32, 32]} />
        <meshBasicMaterial color="#0d0d0f" side={THREE.BackSide} />
      </mesh>

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}
