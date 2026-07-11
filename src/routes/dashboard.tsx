import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Gavel,
  ShieldCheck,
  ShoppingBag,
  ClipboardList,
  Users,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSession } from "@/lib/api/use-session";
import { api } from "@/lib/api/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Sabihub" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    // Client-side gate: no backend to check, so we redirect on the client only.
    if (typeof window !== "undefined" && !api.auth.getSession()) {
      navigate({ to: "/auth", search: { redirect: "/dashboard" } });
    }
  }, [navigate]);

  if (!session) return null;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
              Signed in as {session.role}
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              Welcome back, {session.displayName.split(" ")[0]}.
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-gradient-trust inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-trust-foreground">
              <BadgeCheck className="h-3 w-3" /> Tier {session.tier}
            </span>
            {session.probationUntil && new Date(session.probationUntil) > new Date() && (
              <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-medium text-warning">
                Probation until {new Date(session.probationUntil).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {tilesFor(session.role).map((t) => (
            <Link
              key={t.title}
              to={t.to}
              className="surface-glass group rounded-2xl p-6 transition-transform hover:-translate-y-1"
            >
              <div className="bg-gradient-primary inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-glow">
                <t.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="mt-4 font-display text-lg font-semibold">{t.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary-glow group-hover:text-primary">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          More screens ship in the next stages: browse & bid, escrow checkout, hub pickup with OTP,
          disputes, and the ops console.
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function tilesFor(role: string) {
  const buyer = [
    { title: "Browse auctions", desc: "See what's live and place a bid.", icon: ShoppingBag, to: "/browse" as const },
    { title: "My orders", desc: "Escrow, inspection windows, and hub pickup.", icon: ShieldCheck, to: "/orders" as const },
    { title: "My bids", desc: "Track your active and won auctions.", icon: Gavel, to: "/browse" as const },
  ];
  const seller = [
    { title: "My listings", desc: "Draft, active, sold. Withdraw any time.", icon: ClipboardList, to: "/dashboard" as const },
    { title: "Create listing", desc: "Upload item video + serial photo.", icon: Gavel, to: "/dashboard" as const },
    { title: "Payouts", desc: "Escrow releases after buyer approval.", icon: ShieldCheck, to: "/dashboard" as const },
  ];
  const admin = [
    { title: "Verifications", desc: "Review pending NIN/BVN + liveness.", icon: BadgeCheck, to: "/dashboard" as const },
    { title: "Escrow pipeline", desc: "Funded, inspecting, disputed, released.", icon: ShieldCheck, to: "/dashboard" as const },
    { title: "Users & hubs", desc: "Manage accounts, freezes, hub network.", icon: Users, to: "/dashboard" as const },
  ];
  return role === "seller" ? seller : role === "admin" ? admin : buyer;
}
