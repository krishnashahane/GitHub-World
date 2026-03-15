import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const noopDb = {
  from: () => noopDb,
  select: () => noopDb,
  eq: () => noopDb,
  in: () => noopDb,
  order: () => noopDb,
  limit: () => noopDb,
  single: () => Promise.resolve({ data: null, error: null }),
  then: (fn: (v: { data: null }) => unknown) => Promise.resolve(fn({ data: null })),
};

const mockServerClient = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  },
  from: () => noopDb,
  rpc: () => Promise.resolve({ data: null, error: null }),
};

/** Server-side Supabase client with cookie-based auth (for Server Components & Route Handlers) */
export async function createServerSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return mockServerClient as ReturnType<typeof createServerClient>;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can throw in Server Components (read-only).
            // This is fine — the middleware handles cookie refresh.
          }
        },
      },
    }
  );
}
