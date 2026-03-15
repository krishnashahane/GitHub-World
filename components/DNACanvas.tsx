"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

interface RepoFile {
  path: string;
  type: "file" | "dir";
  size: number;
  language: string | null;
}

interface RepoStructure {
  name: string;
  owner: string;
  stars: number;
  language: string | null;
  files: RepoFile[];
  totalFiles: number;
  totalDirs: number;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f7df1e", Python: "#3572A5",
  Rust: "#dea584", Go: "#00ADD8", Java: "#b07219", "C++": "#f34b7d",
  Ruby: "#701516", Swift: "#F05138", Kotlin: "#A97BFF", PHP: "#4F5D95",
  C: "#555555", "C#": "#178600", HTML: "#e34c26", CSS: "#563d7c",
  Shell: "#89e051", Markdown: "#083fa1", JSON: "#292929", YAML: "#cb171e",
  SQL: "#e38c00", TOML: "#9c4221",
};

function DNAHelix({ files, onSelectGene }: { files: RepoFile[]; onSelectGene: (f: RepoFile) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const fileOnly = useMemo(() => files.filter((f) => f.type === "file").slice(0, 200), [files]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const helixData = useMemo(() => {
    return fileOnly.map((file, i) => {
      const t = i / Math.max(1, fileOnly.length - 1);
      const y = (t - 0.5) * fileOnly.length * 0.15;
      const angle = t * Math.PI * 8; // 4 full rotations
      const radius = 2;
      const sizeScale = Math.max(0.05, Math.min(0.3, Math.log10(Math.max(1, file.size)) * 0.08));
      const color = LANGUAGE_COLORS[file.language ?? ""] ?? "#5c5c6c";

      return {
        file,
        // Strand A position
        posA: new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius),
        // Strand B position (opposite)
        posB: new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius),
        size: sizeScale,
        color,
      };
    });
  }, [fileOnly]);

  return (
    <group ref={groupRef}>
      {/* Backbone strands */}
      {helixData.length > 1 && (
        <>
          <StrandLine points={helixData.map((d) => d.posA)} color="#4ade80" />
          <StrandLine points={helixData.map((d) => d.posB)} color="#f472b6" />
        </>
      )}

      {/* Base pairs (rungs) + gene nodes */}
      {helixData.map((d, i) => (
        <group key={i}>
          {/* Rung connecting strands */}
          <mesh
            position={d.posA
              .clone()
              .add(d.posB)
              .multiplyScalar(0.5)}
          >
            <cylinderGeometry args={[0.008, 0.008, d.posA.distanceTo(d.posB), 4]} />
            <meshBasicMaterial color={d.color} transparent opacity={0.3} />
          </mesh>

          {/* Gene node on strand A */}
          <mesh position={d.posA} onClick={() => onSelectGene(d.file)}>
            <sphereGeometry args={[d.size, 8, 8]} />
            <meshStandardMaterial
              color={d.color}
              emissive={d.color}
              emissiveIntensity={0.2}
              roughness={0.6}
            />
          </mesh>

          {/* Complementary node on strand B */}
          <mesh position={d.posB}>
            <sphereGeometry args={[d.size * 0.6, 6, 6]} />
            <meshStandardMaterial
              color={d.color}
              emissive={d.color}
              emissiveIntensity={0.1}
              roughness={0.8}
              transparent
              opacity={0.5}
            />
          </mesh>

          {/* File label (every 10th file to avoid clutter) */}
          {i % 10 === 0 && (
            <Text
              position={[d.posA.x * 1.3, d.posA.y, d.posA.z * 1.3]}
              fontSize={0.1}
              color="#8c8c9c"
              anchorX="center"
              font="/fonts/Silkscreen-Regular.ttf"
              maxWidth={3}
            >
              {d.file.path.split("/").pop() ?? ""}
            </Text>
          )}
        </group>
      ))}

      {/* Central axis */}
      <mesh>
        <cylinderGeometry
          args={[0.01, 0.01, fileOnly.length * 0.15 + 2, 4]}
        />
        <meshBasicMaterial color="#2a2a30" transparent opacity={0.2} />
      </mesh>

      {/* Repo name at top */}
      <Text
        position={[0, (fileOnly.length * 0.15) / 2 + 1.5, 0]}
        fontSize={0.3}
        color="#e8dcc8"
        anchorX="center"
        font="/fonts/Silkscreen-Regular.ttf"
      >
        {files.length > 0 ? "" : "No files"}
      </Text>
    </group>
  );
}

function StrandLine({ points, color }: { points: THREE.Vector3[]; color: string }) {
  const curve = useMemo(() => {
    if (points.length < 2) return null;
    return new THREE.CatmullRomCurve3(points);
  }, [points]);

  if (!curve) return null;

  const tubeGeom = useMemo(() => {
    return new THREE.TubeGeometry(curve, points.length * 4, 0.015, 6, false);
  }, [curve, points.length]);

  return (
    <mesh geometry={tubeGeom}>
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

function Particles() {
  const positions = useMemo(() => {
    const pos = new Float32Array(1500);
    for (let i = 0; i < 1500; i += 3) {
      pos[i] = (Math.random() - 0.5) * 30;
      pos[i + 1] = (Math.random() - 0.5) * 30;
      pos[i + 2] = (Math.random() - 0.5) * 30;
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
      <pointsMaterial color="#f472b6" size={0.03} transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

export default function DNACanvasComponent({
  structure,
  onSelectGene,
}: {
  structure: RepoStructure;
  onSelectGene: (f: RepoFile) => void;
}) {
  const cameraZ = Math.max(8, structure.files.length * 0.02 + 5);

  return (
    <Canvas
      camera={{ position: [cameraZ * 0.6, 0, cameraZ * 0.8], fov: 50 }}
      style={{ background: "#0d0d0f" }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#f472b6" />

      <DNAHelix files={structure.files} onSelectGene={onSelectGene} />
      <Particles />

      <OrbitControls
        enablePan
        minDistance={3}
        maxDistance={30}
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.2}
      />
    </Canvas>
  );
}
