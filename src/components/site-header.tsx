import { Link } from "@tanstack/react-router";
import { Gavel } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/trust", label: "Trust & safety" },
  { to: "/sellers", label: "For sellers" },
  { to: "/hubs", label: "Hubs" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="surface-glass border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="bg-gradient-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-glow">
              <Gavel className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="gradient-text">Sabihub</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-foreground bg-surface-elevated" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="rounded-lg px-3 py-2 text-sm transition-colors"
                activeOptions={{ exact: true }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              to="/"
              className="bg-gradient-primary inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Get early access
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
