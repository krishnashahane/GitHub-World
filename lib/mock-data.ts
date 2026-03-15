// ─── Mock Data for Demo Mode (no Supabase required) ────────────
import type { DeveloperRecord } from "@/lib/github";

// ─── Helpers ────────────────────────────────────────────────────

const LANGUAGES = [
  "TypeScript",
  "Python",
  "Rust",
  "Go",
  "Java",
  "C++",
  "Ruby",
  "Swift",
  "Kotlin",
  "C#",
  "Elixir",
  "Haskell",
  "Scala",
  "Dart",
  "Zig",
  "Lua",
  "PHP",
  "Clojure",
  "OCaml",
  "Julia",
];

const DISTRICTS: (string | null)[] = [
  "silicon-valley",
  "open-source-hills",
  "startup-row",
  "blockchain-heights",
  "ai-district",
  null,
];

const BIOS = [
  "Building the future, one commit at a time.",
  "Open source enthusiast & coffee addict.",
  "Staff engineer at a stealth startup.",
  "Making distributed systems less distributed.",
  "Full-stack dev who secretly prefers the backend.",
  "Kernel hacker turned web developer.",
  "I mass produce side projects.",
  "Everything is a graph if you squint hard enough.",
  "TypeScript maximalist.",
  "Exploring the intersection of AI and developer tools.",
  "Breaking prod since 2015.",
  "Compilers, runtimes, and terrible puns.",
  "Rust evangelist. Sorry in advance.",
  "Writing Go so you don't have to.",
  null,
];

function pickLang(i: number): string {
  return LANGUAGES[i % LANGUAGES.length];
}

function pickDistrict(i: number): string | null {
  return DISTRICTS[i % DISTRICTS.length];
}

function pickBio(i: number): string | null {
  return BIOS[i % BIOS.length];
}

function fakeRepos(login: string, lang: string | null, stars: number) {
  const names = [
    `${login}-cli`,
    `awesome-${lang?.toLowerCase() ?? "code"}`,
    "dotfiles",
    "api-gateway",
    "neural-search",
  ];
  return names.slice(0, 3).map((name, j) => ({
    name,
    stars: Math.max(1, Math.floor(stars / (j + 1) / 3)),
    language: j === 0 ? lang : LANGUAGES[(LANGUAGES.indexOf(lang ?? "TypeScript") + j) % LANGUAGES.length],
    url: `https://github.com/${login}/${name}`,
  }));
}

function iso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

// ─── Raw developer data (login, name, contribs, stars, repos, lang index) ───

interface Seed {
  login: string;
  name: string | null;
  contribs: number;
  stars: number;
  repos: number;
  langIdx: number;
}

const SEEDS: Seed[] = [
  // #1 — you
  { login: "krishnashahane", name: "Krishna Shahane", contribs: 28450, stars: 14200, repos: 87, langIdx: 0 },
  // Top tier (2-10)
  { login: "torvalds", name: "Linus Torvalds", contribs: 24300, stars: 12800, repos: 12, langIdx: 5 },
  { login: "sindresorhus", name: "Sindre Sorhus", contribs: 21500, stars: 11500, repos: 1100, langIdx: 0 },
  { login: "gaearon", name: "Dan Abramov", contribs: 19800, stars: 9700, repos: 230, langIdx: 0 },
  { login: "yyx990803", name: "Evan You", contribs: 18200, stars: 9100, repos: 180, langIdx: 0 },
  { login: "tj", name: "TJ Holowaychuk", contribs: 17600, stars: 8600, repos: 310, langIdx: 6 },
  { login: "antirez", name: "Salvatore Sanfilippo", contribs: 16400, stars: 8100, repos: 55, langIdx: 5 },
  { login: "mitchellh", name: "Mitchell Hashimoto", contribs: 15800, stars: 7800, repos: 200, langIdx: 3 },
  { login: "dtolnay", name: "David Tolnay", contribs: 14900, stars: 7400, repos: 160, langIdx: 2 },
  { login: "rauchg", name: "Guillermo Rauch", contribs: 14200, stars: 7000, repos: 140, langIdx: 0 },
  // High tier (11-20)
  { login: "jessfraz", name: "Jessie Frazelle", contribs: 12800, stars: 6200, repos: 190, langIdx: 3 },
  { login: "tpope", name: "Tim Pope", contribs: 11900, stars: 5800, repos: 85, langIdx: 6 },
  { login: "mattn", name: "Yasuhiro Matsumoto", contribs: 11200, stars: 5400, repos: 740, langIdx: 3 },
  { login: "charmbracelet", name: "Charm", contribs: 10600, stars: 5100, repos: 95, langIdx: 3 },
  { login: "ThePrimeagen", name: "ThePrimeagen", contribs: 10100, stars: 4800, repos: 75, langIdx: 0 },
  { login: "maboroshi", name: "Sakura Tanaka", contribs: 9500, stars: 4500, repos: 110, langIdx: 2 },
  { login: "avelino", name: "Thiago Avelino", contribs: 9100, stars: 4200, repos: 200, langIdx: 1 },
  { login: "jonhoo", name: "Jon Gjengset", contribs: 8700, stars: 3900, repos: 120, langIdx: 2 },
  { login: "fasterthanlime", name: "Amos Wenger", contribs: 8200, stars: 3600, repos: 90, langIdx: 2 },
  { login: "cassidoo", name: "Cassidy Williams", contribs: 7800, stars: 3300, repos: 160, langIdx: 0 },
  // Mid tier (21-35)
  { login: "sobolevn", name: "Nikita Sobolev", contribs: 5800, stars: 2800, repos: 130, langIdx: 1 },
  { login: "ngryman", name: "Nicolas Gryman", contribs: 5400, stars: 2500, repos: 95, langIdx: 0 },
  { login: "karpathy", name: "Andrej Karpathy", contribs: 5100, stars: 2300, repos: 45, langIdx: 1 },
  { login: "chrisbanes", name: "Chris Banes", contribs: 4700, stars: 2100, repos: 65, langIdx: 8 },
  { login: "orhun", name: "Orhun Parmaksiz", contribs: 4400, stars: 1900, repos: 80, langIdx: 2 },
  { login: "alkasm", name: "Alexander Reynolds", contribs: 4100, stars: 1700, repos: 55, langIdx: 1 },
  { login: "mariofusco", name: "Mario Fusco", contribs: 3800, stars: 1500, repos: 40, langIdx: 4 },
  { login: "swiftdev42", name: "Clara Swift", contribs: 3500, stars: 1300, repos: 35, langIdx: 7 },
  { login: "ziglang_fan", name: "Zig Enthusiast", contribs: 3200, stars: 1100, repos: 28, langIdx: 14 },
  { login: "elixir_alchemist", name: "Paulo Alchemist", contribs: 2900, stars: 980, repos: 50, langIdx: 10 },
  { login: "haskell_monk", name: "Simon Curry", contribs: 2700, stars: 860, repos: 30, langIdx: 11 },
  { login: "scala_wizard", name: "Viktor Klang", contribs: 2400, stars: 740, repos: 42, langIdx: 12 },
  { login: "dart_flutter", name: "Remi Rousselet", contribs: 2200, stars: 640, repos: 60, langIdx: 13 },
  { login: "luajit_dev", name: "Mike Pall", contribs: 1900, stars: 520, repos: 18, langIdx: 15 },
  { login: "devops_ninja", name: "Kelsey Hightower", contribs: 1700, stars: 440, repos: 70, langIdx: 3 },
  // Lower tier (36-50)
  { login: "csharp_maestro", name: "Anders Hejlsberg", contribs: 1400, stars: 380, repos: 22, langIdx: 9 },
  { login: "ocaml_explorer", name: "Xavier Leroy", contribs: 1200, stars: 320, repos: 15, langIdx: 18 },
  { login: "juliacompute", name: "Julia Computing", contribs: 1050, stars: 280, repos: 25, langIdx: 19 },
  { login: "clojure_repl", name: "Rich Hickey", contribs: 920, stars: 240, repos: 12, langIdx: 17 },
  { login: "php_artisan", name: "Taylor Otwell", contribs: 800, stars: 210, repos: 55, langIdx: 16 },
  { login: "webdev_nova", name: "Nova Chen", contribs: 680, stars: 180, repos: 30, langIdx: 0 },
  { login: "bytecruncher", name: "Sam Byteman", contribs: 560, stars: 150, repos: 18, langIdx: 5 },
  { login: "quantum_coder", name: "Priya Quantum", contribs: 470, stars: 120, repos: 14, langIdx: 1 },
  { login: "infra_goblin", name: "Goblin Ops", contribs: 390, stars: 95, repos: 22, langIdx: 3 },
  { login: "data_plumber", name: "Ethan Pipes", contribs: 320, stars: 78, repos: 16, langIdx: 1 },
  { login: "frontend_fox", name: "Fiona Fox", contribs: 260, stars: 62, repos: 20, langIdx: 0 },
  { login: "rusty_beginner", name: "Ray Oxide", contribs: 210, stars: 45, repos: 8, langIdx: 2 },
  { login: "code_padawan", name: "Luke Learner", contribs: 170, stars: 32, repos: 10, langIdx: 4 },
  { login: "first_commit", name: "Mia Startup", contribs: 130, stars: 18, repos: 5, langIdx: 7 },
  { login: "hello_world_dev", name: "Alex Newbie", contribs: 100, stars: 8, repos: 3, langIdx: 1 },
];

// ─── Build the full records ─────────────────────────────────────

function buildDeveloper(seed: Seed, index: number): DeveloperRecord & Record<string, unknown> {
  const rank = index + 1;
  const lang = pickLang(seed.langIdx);
  const contribTotal = Math.floor(seed.contribs * 1.15);
  const xpGithub = Math.floor(seed.contribs * 0.8 + seed.stars * 2);
  const xpTotal = Math.floor(xpGithub * 1.3);
  const xpLevel = Math.min(100, Math.floor(Math.sqrt(xpTotal / 50)));
  const followers = Math.floor(seed.stars * 0.6 + seed.contribs * 0.02);
  const following = Math.max(10, Math.floor(followers * 0.15));
  const accountAge = 2012 + (index % 10);

  return {
    id: index + 1,
    github_login: seed.login,
    github_id: 10000000 + index * 7919,
    name: seed.name,
    avatar_url: `https://avatars.githubusercontent.com/u/${10000000 + index * 7919}`,
    bio: pickBio(index),
    contributions: seed.contribs,
    public_repos: seed.repos,
    total_stars: seed.stars,
    primary_language: lang,
    top_repos: fakeRepos(seed.login, lang, seed.stars),
    rank,
    fetched_at: iso(Math.floor(Math.random() * 3)),
    created_at: iso(365 + index * 10),
    claimed: index < 20,
    fetch_priority: Math.max(1, 5 - Math.floor(index / 10)),
    claimed_at: index < 20 ? iso(30 + index) : null,
    district: pickDistrict(index),
    owned_items: index < 5 ? ["neon-sign", "rooftop-garden"] : [],
    custom_color: null,
    billboard_images: [],
    contributions_total: contribTotal,
    contribution_years: Array.from({ length: 2026 - accountAge }, (_, i) => accountAge + i),
    total_prs: Math.floor(seed.contribs * 0.35),
    total_reviews: Math.floor(seed.contribs * 0.18),
    total_issues: Math.floor(seed.contribs * 0.12),
    repos_contributed_to: Math.floor(seed.repos * 0.4),
    followers,
    following,
    organizations_count: Math.min(12, Math.floor(index < 15 ? 5 : 2)),
    account_created_at: `${accountAge}-0${(index % 9) + 1}-15T00:00:00Z`,
    current_streak: Math.max(0, 90 - index * 2),
    longest_streak: Math.max(10, 180 - index * 3),
    active_days_last_year: Math.min(365, Math.floor(seed.contribs / 8)),
    language_diversity: Math.min(15, Math.floor(seed.repos / 10)),
    xp_total: xpTotal,
    xp_level: xpLevel,
    xp_github: xpGithub,
    achievements: index < 10
      ? ["early-adopter", "streak-master", "star-collector", "open-source-hero"]
      : index < 25
        ? ["early-adopter", "streak-master"]
        : [],
    kudos_count: Math.floor(Math.max(0, 200 - index * 4)),
    visit_count: Math.floor(Math.max(1, 500 - index * 10)),
    loadout: null,
    app_streak: Math.max(0, 60 - index),
    raid_xp: Math.floor(Math.max(0, 1000 - index * 20)),
    active_raid_tag: null,
    rabbit_completed: index < 5,

    // Extra fields expected by the city API response
    current_week_contributions: Math.floor(seed.contribs / 52),
    current_week_kudos_given: 0,
    current_week_kudos_received: 0,
    district_chosen: pickDistrict(index) !== null,
  };
}

// ─── Exports ────────────────────────────────────────────────────

export const MOCK_DEVELOPERS: (DeveloperRecord & Record<string, unknown>)[] = SEEDS.map(
  (seed, i) => buildDeveloper(seed, i),
);

export const MOCK_CITY_STATS = {
  total_developers: MOCK_DEVELOPERS.length,
  total_contributions: MOCK_DEVELOPERS.reduce((sum, d) => sum + d.contributions, 0),
};

/** Return mock developer data (same shape as the Supabase query). */
export function getMockDevelopers(): (DeveloperRecord & Record<string, unknown>)[] {
  return MOCK_DEVELOPERS;
}

/** True when the Supabase URL env var is missing — i.e. demo / offline mode. */
export function isMockMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}
