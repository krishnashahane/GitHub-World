"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const GlobeCanvas = dynamic(() => import("@/components/GlobeCanvas"), { ssr: false });

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
  Lua: "#000080",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

// Generate simulated commit events around the world
function generateCommitEvent(): CommitEvent {
  const cities = [
    { lat: 37.7749, lng: -122.4194, name: "San Francisco" },
    { lat: 40.7128, lng: -74.006, name: "New York" },
    { lat: 51.5074, lng: -0.1278, name: "London" },
    { lat: 48.8566, lng: 2.3522, name: "Paris" },
    { lat: 35.6762, lng: 139.6503, name: "Tokyo" },
    { lat: 52.52, lng: 13.405, name: "Berlin" },
    { lat: -23.5505, lng: -46.6333, name: "São Paulo" },
    { lat: 19.076, lng: 72.8777, name: "Mumbai" },
    { lat: 28.6139, lng: 77.209, name: "New Delhi" },
    { lat: 1.3521, lng: 103.8198, name: "Singapore" },
    { lat: 39.9042, lng: 116.4074, name: "Beijing" },
    { lat: 55.7558, lng: 37.6173, name: "Moscow" },
    { lat: -33.8688, lng: 151.2093, name: "Sydney" },
    { lat: 37.5665, lng: 126.978, name: "Seoul" },
    { lat: 43.6532, lng: -79.3832, name: "Toronto" },
    { lat: 12.9716, lng: 77.5946, name: "Bangalore" },
    { lat: 22.3193, lng: 114.1694, name: "Hong Kong" },
    { lat: 47.6062, lng: -122.3321, name: "Seattle" },
    { lat: 30.0444, lng: 31.2357, name: "Cairo" },
    { lat: -6.2088, lng: 106.8456, name: "Jakarta" },
  ];

  const usernames = [
    "torvalds", "gaearon", "sindresorhus", "tj", "antirez",
    "fabpot", "mrdoob", "yyx990803", "addyosmani", "kentcdodds",
    "ThePrimeagen", "teej_dv", "levelsio", "thdxr", "t3dotgg",
    "mitchellh", "kelseyhightower", "jessfraz", "brendangregg", "dhh",
    "krishnashahane", "devika_code", "rust_wizard", "go_ninja", "swift_master",
  ];

  const repos = [
    "next-app", "react-components", "api-gateway", "ml-pipeline", "cli-tools",
    "rust-engine", "go-microservice", "swift-ui-kit", "data-viz", "auth-service",
    "web-scraper", "game-engine", "css-framework", "state-manager", "test-utils",
    "deploy-bot", "analytics-dashboard", "chat-app", "file-sync", "code-review",
  ];

  const messages = [
    "fix: resolve edge case in auth flow",
    "feat: add dark mode toggle",
    "refactor: clean up API handlers",
    "perf: optimize database queries",
    "fix: handle null pointer exception",
    "feat: implement real-time notifications",
    "chore: update dependencies",
    "docs: update API documentation",
    "feat: add search functionality",
    "fix: correct timezone handling",
    "feat: implement caching layer",
    "refactor: migrate to TypeScript",
    "perf: reduce bundle size by 40%",
    "feat: add OAuth2 integration",
    "fix: resolve memory leak in worker",
  ];

  const languages = Object.keys(LANGUAGE_COLORS);
  const city = cities[Math.floor(Math.random() * cities.length)];
  const jitterLat = (Math.random() - 0.5) * 5;
  const jitterLng = (Math.random() - 0.5) * 5;

  return {
    id: Math.random().toString(36).substring(2, 9),
    lat: city.lat + jitterLat,
    lng: city.lng + jitterLng,
    username: usernames[Math.floor(Math.random() * usernames.length)],
    repo: repos[Math.floor(Math.random() * repos.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    language: languages[Math.floor(Math.random() * languages.length)],
    timestamp: Date.now(),
  };
}

export default function GlobePage() {
  const [commits, setCommits] = useState<CommitEvent[]>([]);
  const [totalCommits, setTotalCommits] = useState(0);
  const [commitsPerSecond, setCommitsPerSecond] = useState(0);
  const [latestCommit, setLatestCommit] = useState<CommitEvent | null>(null);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const cpsRef = useRef<number[]>([]);

  useEffect(() => {
    if (paused) return;

    intervalRef.current = setInterval(() => {
      const batchSize = Math.floor(Math.random() * 3) + 1;
      const newCommits: CommitEvent[] = [];
      for (let i = 0; i < batchSize; i++) {
        newCommits.push(generateCommitEvent());
      }

      setCommits((prev) => [...newCommits, ...prev].slice(0, 200));
      setTotalCommits((prev) => prev + batchSize);
      setLatestCommit(newCommits[0]);

      cpsRef.current.push(batchSize);
      if (cpsRef.current.length > 10) cpsRef.current.shift();
      const avg = cpsRef.current.reduce((a, b) => a + b, 0) / cpsRef.current.length;
      setCommitsPerSecond(Math.round(avg * 2));
    }, 500);

    return () => clearInterval(intervalRef.current);
  }, [paused]);

  const languageStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of commits) {
      if (c.language) {
        counts[c.language] = (counts[c.language] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
  }, [commits]);

  return (
    <main className="min-h-screen bg-bg font-pixel text-warm">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b-2 border-border bg-bg/90 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-muted hover:text-cream transition-colors">
            &larr; CITY
          </Link>
          <h1 className="text-sm uppercase tracking-widest" style={{ color: "#4ade80" }}>
            Commit Globe
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 live-dot" />
            <span className="text-[10px] text-muted">{commitsPerSecond}/s</span>
          </div>
          <span className="text-[10px] text-muted">{totalCommits.toLocaleString()} commits</span>
          <button
            onClick={() => setPaused(!paused)}
            className="border-2 border-border px-3 py-1 text-[10px] text-cream hover:border-border-light transition-colors"
          >
            {paused ? "RESUME" : "PAUSE"}
          </button>
        </div>
      </div>

      {/* Globe */}
      <div className="h-screen w-full pt-12">
        <GlobeCanvas commits={commits} />
      </div>

      {/* Stats Overlay */}
      <div className="fixed bottom-4 left-4 z-40 w-72 border-2 border-border bg-bg-raised/90 backdrop-blur-sm">
        <div className="border-b border-border px-3 py-2">
          <span className="text-[10px] uppercase tracking-widest text-muted">Live Feed</span>
        </div>
        <div className="max-h-48 overflow-y-auto scrollbar-thin">
          {commits.slice(0, 10).map((c) => (
            <div key={c.id} className="border-b border-border/50 px-3 py-2 animate-[fade-in_0.3s_ease-out]">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0"
                  style={{ backgroundColor: LANGUAGE_COLORS[c.language ?? ""] ?? "#666" }}
                />
                <span className="text-[10px] text-cream truncate">{c.username}</span>
                <span className="text-[9px] text-dim">/{c.repo}</span>
              </div>
              <p className="mt-0.5 text-[9px] text-muted normal-case truncate">{c.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Language Distribution */}
      <div className="fixed bottom-4 right-4 z-40 w-48 border-2 border-border bg-bg-raised/90 backdrop-blur-sm p-3">
        <span className="text-[10px] uppercase tracking-widest text-muted">Languages</span>
        <div className="mt-2 space-y-1.5">
          {languageStats.map(([lang, count]) => (
            <div key={lang} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0"
                style={{ backgroundColor: LANGUAGE_COLORS[lang] ?? "#666" }}
              />
              <span className="text-[9px] text-cream flex-1">{lang}</span>
              <span className="text-[9px] text-dim">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Commit Highlight */}
      {latestCommit && (
        <div className="fixed top-16 right-4 z-40 max-w-xs border-2 border-border bg-bg-raised/90 backdrop-blur-sm px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 live-dot" />
            <span className="text-[10px] text-cream">{latestCommit.username}</span>
            <span className="text-[9px] text-dim">pushed to {latestCommit.repo}</span>
          </div>
          <p className="mt-1 text-[9px] text-muted normal-case">{latestCommit.message}</p>
        </div>
      )}
    </main>
  );
}
