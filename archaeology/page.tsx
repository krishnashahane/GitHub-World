"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface CommitRuin {
  sha: string;
  message: string;
  date: string;
  author: string;
  additions: number;
  deletions: number;
}

interface RepoHistory {
  name: string;
  owner: string;
  full_name: string;
  created_at: string;
  age_days: number;
  language: string | null;
  stars: number;
  description: string | null;
  commits: CommitRuin[];
  totalCommits: number;
}

const ACCENT = "#8b5cf6";

const ANCIENT_REPOS = [
  "torvalds/linux",
  "git/git",
  "rails/rails",
  "django/django",
  "python/cpython",
  "nodejs/node",
  "ruby/ruby",
  "php/php-src",
];

function getEra(ageDays: number): { name: string; color: string; description: string } {
  if (ageDays > 5475) return { name: "Ancient", color: "#8b5cf6", description: "Over 15 years old. A true relic." };
  if (ageDays > 3650) return { name: "Classical", color: "#6366f1", description: "10-15 years. Standing the test of time." };
  if (ageDays > 1825) return { name: "Medieval", color: "#3b82f6", description: "5-10 years. Battle-tested and mature." };
  if (ageDays > 730) return { name: "Renaissance", color: "#14b8a6", description: "2-5 years. Growing and evolving." };
  if (ageDays > 365) return { name: "Modern", color: "#22c55e", description: "1-2 years. Fresh but proven." };
  return { name: "Newborn", color: "#eab308", description: "Less than a year. Just getting started." };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 365) return `${Math.floor(days / 365)} years ago`;
  if (days > 30) return `${Math.floor(days / 30)} months ago`;
  if (days > 0) return `${days} days ago`;
  return "today";
}

export default function ArchaeologyPage() {
  const [repoInput, setRepoInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RepoHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const excavate = useCallback(async (input: string) => {
    if (!input.trim() || !input.includes("/")) return;
    setLoading(true);
    setError(null);
    setHistory(null);

    const [owner, repo] = input.split("/");

    try {
      // Fetch repo info
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!repoRes.ok) {
        setError(repoRes.status === 404 ? "Repository not found" : "Failed to fetch");
        setLoading(false);
        return;
      }
      const repoData = await repoRes.json();

      // Fetch oldest commits (first page, per_page=1, to get total from Link header isn't reliable)
      // Instead fetch recent commits for the timeline
      const commitsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`
      );
      let commits: CommitRuin[] = [];
      if (commitsRes.ok) {
        const commitsData = await commitsRes.json();
        commits = commitsData.map((c: {
          sha: string;
          commit: { message: string; author: { date: string; name: string } };
          stats?: { additions: number; deletions: number };
        }) => ({
          sha: c.sha.slice(0, 7),
          message: c.commit.message.split("\n")[0].slice(0, 80),
          date: c.commit.author.date,
          author: c.commit.author.name,
          additions: c.stats?.additions ?? 0,
          deletions: c.stats?.deletions ?? 0,
        }));
      }

      const createdAt = new Date(repoData.created_at);
      const ageDays = Math.floor((Date.now() - createdAt.getTime()) / 86400000);

      setHistory({
        name: repoData.name,
        owner: repoData.owner.login,
        full_name: repoData.full_name,
        created_at: repoData.created_at,
        age_days: ageDays,
        language: repoData.language,
        stars: repoData.stargazers_count,
        description: repoData.description,
        commits,
        totalCommits: 0,
      });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const era = history ? getEra(history.age_days) : null;

  return (
    <main className="min-h-screen bg-bg font-pixel text-warm">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b-2 border-border bg-bg/90 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-muted hover:text-cream transition-colors">
            &larr; CITY
          </Link>
          <h1 className="text-sm uppercase tracking-widest" style={{ color: ACCENT }}>
            Code Archaeology
          </h1>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            excavate(repoInput);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            placeholder="owner/repo"
            className="w-44 border-2 border-border bg-transparent px-2 py-1 text-xs text-cream outline-none focus:border-border-light normal-case"
          />
          <button
            type="submit"
            disabled={loading}
            className="border-2 px-3 py-1 text-[10px] transition-colors"
            style={{ borderColor: ACCENT, color: ACCENT }}
          >
            {loading ? "..." : "EXCAVATE"}
          </button>
        </form>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-20 pb-10">
        {!history && (
          <div className="text-center mt-20">
            <p className="text-2xl" style={{ color: ACCENT }}>CODE ARCHAEOLOGY</p>
            <p className="mt-3 text-xs text-muted normal-case">
              Explore old repos like ruins. Uncover the evolution of code through time.
            </p>
            {error && (
              <p className="mt-4 text-xs normal-case" style={{ color: "#f87171" }}>
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {ANCIENT_REPOS.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRepoInput(r);
                    excavate(r);
                  }}
                  className="border border-border px-3 py-1.5 text-[10px] text-dim hover:text-cream hover:border-border-light transition-colors normal-case"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {history && era && (
          <div className="animate-[fade-in_0.3s_ease-out]">
            {/* Era Classification */}
            <div
              className="border-[3px] p-6 text-center mb-8"
              style={{ borderColor: era.color, backgroundColor: `${era.color}08` }}
            >
              <p className="text-[10px] text-muted mb-1">CLASSIFIED AS</p>
              <p className="text-2xl" style={{ color: era.color }}>{era.name}</p>
              <p className="mt-1 text-[10px] text-muted normal-case">{era.description}</p>
              <div className="mt-4 flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-cream">{Math.floor(history.age_days / 365)}y {history.age_days % 365}d</p>
                  <p className="text-[8px] text-dim">Age</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-cream">{formatDate(history.created_at)}</p>
                  <p className="text-[8px] text-dim">Born</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-cream">{history.stars.toLocaleString()}</p>
                  <p className="text-[8px] text-dim">Stars</p>
                </div>
              </div>
            </div>

            {/* Repo Info */}
            <div className="border-2 border-border bg-bg-raised p-5 mb-6">
              <p className="text-sm text-cream normal-case">{history.full_name}</p>
              {history.description && (
                <p className="mt-1 text-[10px] text-muted normal-case">{history.description}</p>
              )}
              {history.language && (
                <p className="mt-2 text-[9px] text-dim">
                  Primary language: <span className="text-cream">{history.language}</span>
                </p>
              )}
            </div>

            {/* Commit Timeline */}
            <div className="border-2 border-border bg-bg-raised p-5">
              <p className="text-[10px] text-muted uppercase tracking-widest mb-4">Recent Excavations</p>
              <div className="relative">
                {/* Timeline line */}
                <div
                  className="absolute left-3 top-0 bottom-0 w-px"
                  style={{ backgroundColor: era.color, opacity: 0.3 }}
                />

                {history.commits.map((commit, i) => (
                  <div key={commit.sha} className="relative pl-8 pb-4">
                    {/* Dot */}
                    <div
                      className="absolute left-2 top-1 h-2.5 w-2.5"
                      style={{
                        backgroundColor: era.color,
                        opacity: 1 - i * 0.03,
                      }}
                    />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-cream normal-case truncate">
                          {commit.message}
                        </p>
                        <p className="text-[9px] text-dim normal-case mt-0.5">
                          <span className="text-muted">{commit.sha}</span>
                          {" by "}
                          {commit.author}
                        </p>
                      </div>
                      <span className="text-[9px] text-dim shrink-0 normal-case">
                        {getRelativeTime(commit.date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Timeline Visual */}
            <div className="mt-6 border-2 border-border bg-bg-raised p-5">
              <p className="text-[10px] text-muted uppercase tracking-widest mb-3">Timeline</p>
              <div className="flex items-center gap-1 h-6">
                {Array.from({ length: Math.min(20, Math.ceil(history.age_days / 365)) }, (_, i) => {
                  const yearAge = i + 1;
                  const opacity = 0.2 + (yearAge / Math.ceil(history.age_days / 365)) * 0.8;
                  return (
                    <div
                      key={i}
                      className="flex-1 h-full"
                      style={{ backgroundColor: era.color, opacity }}
                      title={`Year ${yearAge}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[8px] text-dim">{new Date(history.created_at).getFullYear()}</span>
                <span className="text-[8px] text-dim">{new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
