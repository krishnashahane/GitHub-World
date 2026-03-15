"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const DNACanvas = dynamic(() => import("@/components/DNACanvas"), { ssr: false });

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

export default function DNAPage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [structure, setStructure] = useState<RepoStructure | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedGene, setSelectedGene] = useState<RepoFile | null>(null);

  const fetchRepo = useCallback(async (input: string) => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setStructure(null);
    setSelectedGene(null);

    try {
      // Parse owner/repo from input
      let owner = "";
      let repo = "";

      if (input.includes("/")) {
        const parts = input.replace("https://github.com/", "").split("/");
        owner = parts[0];
        repo = parts[1];
      } else {
        setError("Enter owner/repo format (e.g. facebook/react)");
        setLoading(false);
        return;
      }

      // Fetch repo info
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!repoRes.ok) {
        setError(repoRes.status === 404 ? "Repository not found" : "Failed to fetch");
        setLoading(false);
        return;
      }
      const repoData = await repoRes.json();

      // Fetch tree
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`
      );

      let files: RepoFile[] = [];
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        files = (treeData.tree ?? [])
          .filter((t: { type: string; path: string }) => !t.path.startsWith("."))
          .slice(0, 500)
          .map((t: { path: string; type: string; size?: number }) => ({
            path: t.path,
            type: t.type === "tree" ? "dir" : "file",
            size: t.size ?? 0,
            language: guessLanguage(t.path),
          }));
      }

      setStructure({
        name: repoData.name,
        owner: repoData.owner.login,
        stars: repoData.stargazers_count,
        language: repoData.language,
        files,
        totalFiles: files.filter((f) => f.type === "file").length,
        totalDirs: files.filter((f) => f.type === "dir").length,
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
          <h1 className="text-sm uppercase tracking-widest" style={{ color: "#f472b6" }}>
            Repo DNA
          </h1>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchRepo(repoUrl);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="owner/repo"
            className="w-48 border-2 border-border bg-transparent px-2 py-1 text-xs text-cream outline-none focus:border-border-light normal-case"
          />
          <button
            type="submit"
            disabled={loading}
            className="border-2 px-3 py-1 text-[10px] transition-colors hover:text-bg"
            style={{ borderColor: "#f472b6", color: "#f472b6" }}
          >
            {loading ? "..." : "DECODE"}
          </button>
        </form>
      </div>

      {/* DNA View */}
      <div className="h-screen w-full pt-12">
        {structure ? (
          <DNACanvas structure={structure} onSelectGene={setSelectedGene} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-2xl" style={{ color: "#f472b6" }}>
                REPO DNA
              </p>
              <p className="mt-3 text-xs text-muted normal-case">
                Visualize repository structure as DNA strands — files are genes, directories are chromosomes
              </p>
              {error && (
                <p className="mt-4 text-xs normal-case" style={{ color: "#f87171" }}>
                  {error}
                </p>
              )}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {["facebook/react", "microsoft/vscode", "denoland/deno", "vercel/next.js", "rust-lang/rust"].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRepoUrl(r);
                      fetchRepo(r);
                    }}
                    className="border-2 border-border px-3 py-1.5 text-[10px] text-muted hover:text-cream hover:border-border-light transition-colors normal-case"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Repo Info */}
      {structure && (
        <div className="fixed bottom-4 left-4 z-40 w-72 border-2 border-border bg-bg-raised/90 backdrop-blur-sm p-4">
          <p className="text-xs text-cream normal-case">
            {structure.owner}/{structure.name}
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[10px] text-cream">{structure.totalFiles}</p>
              <p className="text-[8px] text-dim">Genes</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-cream">{structure.totalDirs}</p>
              <p className="text-[8px] text-dim">Chromosomes</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-cream">{structure.stars.toLocaleString()}</p>
              <p className="text-[8px] text-dim">Stars</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Gene */}
      {selectedGene && (
        <div className="fixed bottom-4 right-4 z-40 w-64 border-2 border-border bg-bg-raised/90 backdrop-blur-sm p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted">Gene</p>
            <button onClick={() => setSelectedGene(null)} className="text-[10px] text-muted hover:text-cream">
              &#10005;
            </button>
          </div>
          <p className="mt-1 text-xs text-cream normal-case break-all">{selectedGene.path}</p>
          {selectedGene.language && (
            <p className="mt-1 text-[9px] text-muted">
              Type: <span className="text-cream">{selectedGene.language}</span>
            </p>
          )}
          <p className="text-[9px] text-muted">
            Size: <span className="text-cream">{(selectedGene.size / 1024).toFixed(1)} KB</span>
          </p>
        </div>
      )}
    </main>
  );
}

function guessLanguage(path: string): string | null {
  const ext = path.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript",
    py: "Python", rs: "Rust", go: "Go", java: "Java", cpp: "C++", c: "C",
    rb: "Ruby", swift: "Swift", kt: "Kotlin", php: "PHP", dart: "Dart",
    lua: "Lua", sh: "Shell", html: "HTML", css: "CSS", scss: "CSS",
    md: "Markdown", json: "JSON", yaml: "YAML", yml: "YAML", toml: "TOML",
    sql: "SQL", graphql: "GraphQL", proto: "Protobuf",
  };
  return ext ? map[ext] ?? null : null;
}
