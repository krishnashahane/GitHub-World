"use client";

import Link from "next/link";

const ACCENT = "#c8e64a";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-bg font-pixel uppercase text-warm">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-muted transition-colors hover:text-cream sm:mb-8"
        >
          &larr; Back to City
        </Link>

        <h1 className="text-2xl text-cream sm:text-3xl">
          <span style={{ color: ACCENT }}>Github World</span>
        </h1>
        <p className="mt-2 text-xs text-muted normal-case sm:text-sm">
          Built by Krishna Shahane. Visualize GitHub as a living 3D universe.
        </p>

        <div className="mt-8 flex flex-col gap-5">
          <div className="border-[3px] border-border bg-bg-raised p-5 sm:p-6">
            <p className="text-sm text-cream">
              <span style={{ color: ACCENT }}>01.</span> Explore the City
            </p>
            <p className="mt-2 text-xs text-muted normal-case">
              Search any GitHub username and watch their contributions transform into a 3D building.
            </p>
            <Link
              href="/"
              className="btn-press mt-4 inline-block border-2 px-5 py-2 text-xs transition-colors"
              style={{ borderColor: ACCENT, color: ACCENT }}
            >
              Go to the city
            </Link>
          </div>

          <div className="border-[3px] border-border bg-bg-raised p-5 sm:p-6">
            <p className="text-sm text-cream">
              <span style={{ color: ACCENT }}>02.</span> Commit Globe
            </p>
            <p className="mt-2 text-xs text-muted normal-case">
              Watch real-time commits happening across the globe on an interactive 3D earth.
            </p>
            <Link
              href="/globe"
              className="btn-press mt-4 inline-block border-2 border-border px-5 py-2 text-xs text-muted transition-colors hover:border-border-light hover:text-cream"
            >
              Launch Globe
            </Link>
          </div>

          <div className="border-[3px] border-border bg-bg-raised p-5 sm:p-6">
            <p className="text-sm text-cream">
              <span style={{ color: ACCENT }}>03.</span> Solar System
            </p>
            <p className="mt-2 text-xs text-muted normal-case">
              Explore any developer as a planet with repos orbiting as moons.
            </p>
            <Link
              href="/solar"
              className="btn-press mt-4 inline-block border-2 border-border px-5 py-2 text-xs text-muted transition-colors hover:border-border-light hover:text-cream"
            >
              Enter Orbit
            </Link>
          </div>

          <div className="border-[3px] border-border bg-bg-raised p-5 sm:p-6">
            <p className="text-sm text-cream">
              <span style={{ color: ACCENT }}>04.</span> Repo DNA
            </p>
            <p className="mt-2 text-xs text-muted normal-case">
              Visualize repository structure as DNA strands — files are genes, directories are chromosomes.
            </p>
            <Link
              href="/dna"
              className="btn-press mt-4 inline-block border-2 border-border px-5 py-2 text-xs text-muted transition-colors hover:border-border-light hover:text-cream"
            >
              Decode DNA
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
