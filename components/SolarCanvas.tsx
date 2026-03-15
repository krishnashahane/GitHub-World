"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

interface RepoMoon {
  name: string;
  stars: number;
  language: string | null;
  size: number;
  forks: number;
}

interface DevPlanet {
  login: string;
  name: string | null;
  avatar_url: string | null;
  contributions: number;
  public_repos: number;
  total_stars: number;
  followers: number;
  primary_language: string | null;
  repos: RepoMoon[];
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
  HTML: "#e34c26",
  CSS: "#563d7c",
};

function Planet({ planet }: { planet: DevPlanet }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const planetSize = Math.max(0.8, Math.min(2, Math.log10(Math.max(1, planet.total_stars)) * 0.5));
  const color = LANGUAGE_COLORS[planet.primary_language ?? ""] ?? "#4ade80";

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group>
      {/* Planet body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[planetSize, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[planetSize * 1.15, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
      {/* Name label */}
      <Text
        position={[0, planetSize + 0.5, 0]}
        fontSize={0.25}
        color="#e8dcc8"
        anchorX="center"
        anchorY="bottom"
        font="/fonts/Silkscreen-Regular.ttf"
      >
        {planet.login}
      </Text>
      {/* Stats ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[planetSize * 1.3, 0.02, 8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function Moon({
  repo,
  orbitRadius,
  orbitSpeed,
  startAngle,
  onSelect,
}: {
  repo: RepoMoon;
  orbitRadius: number;
  orbitSpeed: number;
  startAngle: number;
  onSelect: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const moonSize = Math.max(0.08, Math.min(0.4, Math.log10(Math.max(1, repo.stars + 1)) * 0.12));
  const color = LANGUAGE_COLORS[repo.language ?? ""] ?? "#8c8c9c";

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.elapsedTime * orbitSpeed + startAngle;
      groupRef.current.position.x = Math.cos(t) * orbitRadius;
      groupRef.current.position.z = Math.sin(t) * orbitRadius;
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh onClick={onSelect}>
        <sphereGeometry args={[moonSize, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.1}
          roughness={0.8}
        />
      </mesh>
      {/* Moon name */}
      <Text
        position={[0, moonSize + 0.15, 0]}
        fontSize={0.1}
        color="#8c8c9c"
        anchorX="center"
        anchorY="bottom"
        font="/fonts/Silkscreen-Regular.ttf"
        maxWidth={2}
      >
        {repo.name}
      </Text>
    </group>
  );
}

function OrbitRings({ repos, planetSize }: { repos: RepoMoon[]; planetSize: number }) {
  return (
    <>
      {repos.map((_, i) => {
        const radius = planetSize * 1.8 + i * 0.8;
        return (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.005, 4, 128]} />
            <meshBasicMaterial color="#2a2a30" transparent opacity={0.3} />
          </mesh>
        );
      })}
    </>
  );
}

function Stars() {
  const positions = useMemo(() => {
    const pos = new Float32Array(3000);
    for (let i = 0; i < 3000; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 30 + Math.random() * 20;
      pos[i] = r * Math.sin(phi) * Math.cos(theta);
      pos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.05} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function SolarSystem({
  planet,
  onSelectMoon,
}: {
  planet: DevPlanet;
  onSelectMoon: (moon: RepoMoon) => void;
}) {
  const planetSize = Math.max(0.8, Math.min(2, Math.log10(Math.max(1, planet.total_stars)) * 0.5));

  return (
    <>
      <Planet planet={planet} />
      <OrbitRings repos={planet.repos} planetSize={planetSize} />
      {planet.repos.map((repo, i) => (
        <Moon
          key={repo.name}
          repo={repo}
          orbitRadius={planetSize * 1.8 + i * 0.8}
          orbitSpeed={0.5 / (1 + i * 0.3)}
          startAngle={(i / planet.repos.length) * Math.PI * 2}
          onSelect={() => onSelectMoon(repo)}
        />
      ))}
    </>
  );
}

export default function SolarCanvasComponent({
  planet,
  onSelectMoon,
}: {
  planet: DevPlanet;
  onSelectMoon: (moon: RepoMoon) => void;
}) {
  const cameraDistance = Math.max(8, planet.repos.length * 0.6 + 5);

  return (
    <Canvas
      camera={{ position: [cameraDistance * 0.7, cameraDistance * 0.4, cameraDistance * 0.7], fov: 50 }}
      style={{ background: "#0d0d0f" }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={1} color="#ffd700" distance={50} />
      <directionalLight position={[10, 5, 10]} intensity={0.5} />

      <SolarSystem planet={planet} onSelectMoon={onSelectMoon} />
      <Stars />

      <OrbitControls
        enablePan
        minDistance={3}
        maxDistance={30}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
