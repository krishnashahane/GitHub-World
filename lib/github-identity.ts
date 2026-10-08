import type { User } from "@supabase/supabase-js";

export function getGithubLogin(user: User): string | null {
  const identity = user.identities?.find((item) => item.provider === "github");
  const data = identity?.identity_data as Record<string, unknown> | undefined;
  const login =
    (typeof data?.user_name === "string" && data.user_name) ||
    (typeof data?.preferred_username === "string" && data.preferred_username) ||
    (typeof data?.login === "string" && data.login) ||
    null;

  return login ? login.trim().toLowerCase() : null;
}
