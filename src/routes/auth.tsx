import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { Gavel, ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";
import { api } from "@/lib/api/client";
import type { UserRole } from "@/lib/api/types";
import { SiteHeader } from "@/components/site-header";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Sabihub" },
      { name: "description", content: "Sign in to Sabihub with a demo role." },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: searchSchema,
  component: AuthPage,
});

const roles: {
  id: UserRole;
  title: string;
  desc: string;
  icon: typeof Gavel;
  accent: string;
}[] = [
  {
    id: "buyer",
    title: "Buyer",
    desc: "Browse auctions, place bids, track escrow and pickup.",
    icon: ShoppingBag,
    accent: "primary",
  },
  {
    id: "seller",
    title: "Seller",
    desc: "List items, manage auctions, drop off at a hub, get paid.",
    icon: Gavel,
    accent: "trust",
  },
  {
    id: "admin",
    title: "Admin / Ops",
    desc: "Review verifications, disputes, hubs, and escrow pipeline.",
    icon: ShieldCheck,
    accent: "accent",
  },
];

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });

  const signIn = (role: UserRole) => {
    api.auth.signInAs(role);
    navigate({ to: redirect ?? "/dashboard" });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
          Demo sign-in
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
          Pick a role to preview.
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          The backend isn't wired up yet — sign in fakes a session in your browser only. Swap roles
          any time to see the app from a different angle.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => signIn(r.id)}
              className="surface-glass group rounded-2xl p-6 text-left transition-transform hover:-translate-y-1"
            >
              <div
                className={
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-glow " +
                  (r.accent === "trust"
                    ? "bg-gradient-trust"
                    : r.accent === "accent"
                      ? "bg-accent"
                      : "bg-gradient-primary")
                }
              >
                <r.icon
                  className={
                    "h-5 w-5 " +
                    (r.accent === "trust"
                      ? "text-trust-foreground"
                      : "text-primary-foreground")
                  }
                />
              </div>
              <div className="mt-4 font-display text-lg font-semibold">{r.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-sm text-primary-glow group-hover:text-primary">
                Continue as {r.title.toLowerCase()} <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
