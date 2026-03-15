"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const SolarCanvas = dynamic(() => import("@/components/SolarCanvas"), { ssr: false });

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

const ACCENT = "#c8e64a";

export default function SolarPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [planet, setPlanet] = useState<DevPlanet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMoon, setSelectedMoon] = useState<RepoMoon | null>(null);

  const fetchDeveloper = useCallback(async (login: string) => {
    if (!login.trim()) return;
    setLoading(true);
    setError(null);
    setPlanet(null);
    setSelectedMoon(null);

    try {
      // Fetch user data from GitHub API directly
      const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`);
      if (!userRes.ok) {
        setError(userRes.status === 404 ? "User not found" : "Failed to fetch");
        return;
      }
      const user = await userRes.json();
      if (user.type === "Organization") {
        setError("Organizations are not supported");
        return;
      }

      // Fetch repos
      const reposRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(user.login)}/repos?sort=stars&per_page=30`
      );
      const repos = reposRes.ok ? await reposRes.json() : [];

      const repoMoons: RepoMoon[] = repos
        .filter((r: { fork: boolean }) => !r.fork)
        .slice(0, 20)
        .map((r: { name: string; stargazers_count: number; language: string | null; size: number; forks_count: number }) => ({
          name: r.name,
          stars: r.stargazers_count,
          language: r.language,
          size: r.size,
          forks: r.forks_count,
        }));

      setPlanet({
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        contributions: 0,
        public_repos: user.public_repos,
        total_stars: repoMoons.reduce((s: number, r: RepoMoon) => s + r.stars, 0),
        followers: user.followers,
        primary_language: repoMoons[0]?.language ?? null,
        repos: repoMoons,
      });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <main className="min-h-screen bg-bg font-pixel text-warm">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b-2 border-border bg-bg/90 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-muted hover:text-cream transition-colors">
            &larr; CITY
          </Link>
          <h1 className="text-sm uppercase tracking-widest" style={{ color: "#a78bfa" }}>
            Solar System
          </h1>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchDeveloper(username);
          }}
          className="flex items-center gap-2"
        >
          <span className="text-[10px] text-dim">@</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="github username"
            className="w-40 border-2 border-border bg-transparent px-2 py-1 text-xs text-cream outline-none focus:border-border-light normal-case"
          />
          <button
            type="submit"
            disabled={loading}
            className="border-2 px-3 py-1 text-[10px] transition-colors hover:text-bg"
            style={{
              borderColor: "#a78bfa",
              color: "#a78bfa",
            }}
          >
            {loading ? "..." : "ORBIT"}
          </button>
        </form>
      </div>

      {/* Solar System View */}
      <div className="h-screen w-full pt-12">
        {planet ? (
          <SolarCanvas planet={planet} onSelectMoon={setSelectedMoon} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-2xl" style={{ color: "#a78bfa" }}>
                SOLAR SYSTEM
              </p>
              <p className="mt-3 text-xs text-muted normal-case">
                Enter a GitHub username to see them as a planet with repos orbiting as moons
              </p>
              {error && (
                <p className="mt-4 text-xs normal-case" style={{ color: "#f87171" }}>
                  {error}
                </p>
              )}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {["krishnashahane", "torvalds", "gaearon", "sindresorhus", "yyx990803"].map((u) => (
                  <button
                    key={u}
                    onClick={() => {
                      setUsername(u);
                      fetchDeveloper(u);
                    }}
                    className="border-2 border-border px-3 py-1.5 text-[10px] text-muted hover:text-cream hover:border-border-light transition-colors normal-case"
                  >
                    @{u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Planet Info Panel */}
      {planet && (
        <div className="fixed bottom-4 left-4 z-40 w-72 border-2 border-border bg-bg-raised/90 backdrop-blur-sm">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              {planet.avatar_url && (
                <img
                  src={planet.avatar_url}
                  alt={planet.login}
                  className="h-8 w-8"
                  style={{ imageRendering: "pixelated" }}
                />
              )}
              <div>
                <p className="text-xs text-cream">{planet.name ?? planet.login}</p>
                <p className="text-[9px] text-muted normal-case">@{planet.login}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-px bg-border">
            <div className="bg-bg-raised px-3 py-2 text-center">
              <p className="text-[10px] text-cream">{planet.public_repos}</p>
              <p className="text-[8px] text-dim">Repos</p>
            </div>
            <div className="bg-bg-raised px-3 py-2 text-center">
              <p className="text-[10px] text-cream">{planet.total_stars.toLocaleString()}</p>
              <p className="text-[8px] text-dim">Stars</p>
            </div>
            <div className="bg-bg-raised px-3 py-2 text-center">
              <p className="text-[10px] text-cream">{planet.followers.toLocaleString()}</p>
              <p className="text-[8px] text-dim">Followers</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Moon Info */}
      {selectedMoon && (
        <div className="fixed bottom-4 right-4 z-40 w-64 border-2 border-border bg-bg-raised/90 backdrop-blur-sm p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-cream normal-case">{selectedMoon.name}</p>
            <button
              onClick={() => setSelectedMoon(null)}
              className="text-[10px] text-muted hover:text-cream"
            >
              &#10005;
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-[9px] text-muted">
              Stars: <span className="text-cream">{selectedMoon.stars.toLocaleString()}</span>
            </p>
            <p className="text-[9px] text-muted">
              Forks: <span className="text-cream">{selectedMoon.forks}</span>
            </p>
            {selectedMoon.language && (
              <p className="text-[9px] text-muted">
                Language: <span className="text-cream">{selectedMoon.language}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
