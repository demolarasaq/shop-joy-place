import { useEffect, useState } from "react";
import { api } from "./client";
import type { Session } from "./types";

export function useSession(): Session | null {
  return useAuthState().session;
}

export function useAuthState(): { session: Session | null; loading: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const sync = () => {
      if (active) setSession(api.auth.getSession());
    };

    api.auth.ready().then(() => {
      if (!active) return;
      sync();
      setLoading(false);
    });

    window.addEventListener("sabihub:session", sync);
    return () => {
      active = false;
      window.removeEventListener("sabihub:session", sync);
    };
  }, []);

  return { session, loading };
}
