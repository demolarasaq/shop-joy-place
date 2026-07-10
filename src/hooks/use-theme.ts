import { useEffect, useState } from "react";

export type Theme = "dark" | "light";
const KEY = "sabihub.theme.v1";

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && window.localStorage.getItem(KEY)) as Theme | null;
    const initial: Theme = stored ?? "dark";
    setThemeState(initial);
    apply(initial);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    apply(t);
    try {
      window.localStorage.setItem(KEY, t);
    } catch {
      /* noop */
    }
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggle };
}
