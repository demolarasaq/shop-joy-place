import { Link, useNavigate } from "@tanstack/react-router";
import { Gavel, LogOut, Moon, Sun, User } from "lucide-react";
import { useSession } from "@/lib/api/use-session";
import { api } from "@/lib/api/client";
import { useTheme } from "@/hooks/use-theme";

const nav = [
  { to: "/browse", label: "Browse" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/trust", label: "Trust & safety" },
  { to: "/sellers", label: "For sellers" },
  { to: "/hubs", label: "Hubs" },
] as const;

export function SiteHeader() {
  const session = useSession();
  const navigate = useNavigate();

  const signOut = () => {
    api.auth.signOut();
    navigate({ to: "/" });
  };

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
            {session ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden items-center gap-2 rounded-lg border border-border bg-surface-elevated/60 px-3 py-2 text-sm sm:inline-flex"
                >
                  <User className="h-3.5 w-3.5 text-primary-glow" />
                  <span className="text-foreground">{session.displayName}</span>
                  <span className="rounded-full bg-trust/20 px-2 py-0.5 text-[10px] font-medium text-trust uppercase">
                    {session.role}
                  </span>
                </Link>
                <button
                  onClick={signOut}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth"
                  className="bg-gradient-primary inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
                >
                  Get early access
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
