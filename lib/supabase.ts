import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/** Check if we're running in mock mode (no Supabase configured) */
export function isMockMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_MOCK_MODE === "true";
}

/** Client-side Supabase client (anon key, respects RLS) — singleton for "use client" */
export function createBrowserSupabase() {
  if (isMockMode()) {
    // Return a minimal mock that won't crash
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ data: null, error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
      channel: () => ({
        on: () => ({ subscribe: () => ({}) }),
        subscribe: () => ({}),
        unsubscribe: () => {},
      }),
    } as unknown as ReturnType<typeof createBrowserClient>;
  }

  if (browserClient) return browserClient;

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return browserClient;
}

/** Server-side Supabase client (service role, bypasses RLS) */
export function getSupabaseAdmin(): SupabaseClient {
  if (isMockMode()) {
    throw new Error("Supabase is not configured. Running in mock mode.");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * Broadcast a message to all Supabase Realtime subscribers on a channel.
 */
export async function broadcastToChannel(
  topic: string,
  event: string,
  payload: Record<string, unknown>,
) {
  if (isMockMode()) return;

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/realtime/v1/api/broadcast`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ topic, event, payload }],
      }),
    });
  } catch {
    // Fire and forget
  }
}
