import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

// The generated attacher calls supabase.auth.getSession() at request time, which
// can return nothing while the auth lock is held (e.g. right after page load).
// We keep the latest access token in memory instead, updated from the auth event
// itself, and fall back to getSession() only when we have nothing cached.
let accessToken: string | null = null;

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((_event, session) => {
    accessToken = session?.access_token ?? null;
  });
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export const attachCachedAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token = accessToken;
    if (!token && typeof window !== "undefined") {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token ?? null;
      accessToken = token;
    }
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  },
);
