import { type NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Inline rate limiter (Edge runtime compatible)
// ---------------------------------------------------------------------------
interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>();
let lastCleanup = Date.now();

function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup > 60_000) {
    lastCleanup = now;
    for (const [k, e] of store) { if (now > e.resetAt) store.delete(k); }
  }
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, reset: now + windowMs };
  }
  if (entry.count >= limit) {
    return { ok: false, remaining: 0, reset: entry.resetAt };
  }
  entry.count++;
  return { ok: true, remaining: limit - entry.count, reset: entry.resetAt };
}

// ---------------------------------------------------------------------------
// Route-specific rate limits
// ---------------------------------------------------------------------------
const ROUTE_LIMITS: [string, number, number][] = [
  ["/api/customizations/upload", 5, 60_000],
  ["/api/customizations", 10, 60_000],
  ["/api/sky-ads/track", 30, 60_000],
  ["/api/sky-ads", 30, 60_000],
  ["/api/raid", 15, 60_000],
  ["/api/checkin", 10, 60_000],
  ["/api/heartbeats", 60, 60_000],
  ["/api/interactions", 60, 60_000],
  ["/api/achievements", 30, 60_000],
  ["/api/loadout", 10, 60_000],
  ["/api/feed", 30, 60_000],
  ["/api/checkout", 6, 60_000],
  ["/api/claim", 5, 60_000],
  ["/api/city", 30, 60_000],
  ["/api/dev/", 60, 60_000],
  ["/api/items", 30, 60_000],
  ["/api/auth", 10, 60_000],
];

function getLimitForPath(pathname: string) {
  if (pathname.startsWith("/api/webhooks")) return { limit: 1000, window: 60_000, group: "webhooks" };
  for (const [prefix, limit, window] of ROUTE_LIMITS) {
    if (pathname.startsWith(prefix)) return { limit, window, group: prefix };
  }
  if (pathname.startsWith("/api/")) return { limit: 60, window: 60_000, group: "/api" };
  return { limit: 120, window: 60_000, group: "/pages" };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  const { limit, window, group } = getLimitForPath(pathname);
  const { ok, remaining, reset } = rateLimit(`${ip}:${group}`, limit, window);

  if (!ok) {
    return new NextResponse(
      JSON.stringify({ error: "Too many requests. Please slow down." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(reset / 1000)),
        },
      },
    );
  }

  const response = NextResponse.next({ request });
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(reset / 1000)));

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|models|fonts|api/cron).*)",
  ],
};
