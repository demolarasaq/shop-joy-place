import { useEffect, useState } from "react";
import { api } from "./client";
import type { Session } from "./types";

export function useSession(): Session | null {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(api.auth.getSession());
    const onChange = () => setSession(api.auth.getSession());
    window.addEventListener("sabihub:session", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("sabihub:session", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return session;
}
