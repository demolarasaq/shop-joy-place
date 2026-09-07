import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { useAuthState } from "@/lib/api/use-session";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

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
  const { session, loading } = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/auth", search: { redirect: "/dashboard" } });
    }
  }, [loading, session, navigate]);

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

        <AccountActions
          role={session.role}
          verificationStatus={session.verificationStatus}
        />
      </section>
      <SiteFooter />
    </div>
  );
}

function AccountActions({
  role,
  verificationStatus,
}: {
  role: string;
  verificationStatus: string;
}) {
  const [busy, setBusy] = useState(false);

  const startSelling = async () => {
    setBusy(true);
    try {
      await api.auth.becomeSeller();
      toast.success("Selling switched on", {
        description: "Your seller tools are now on this dashboard.",
      });
    } catch {
      toast.error("Could not switch on selling");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    try {
      await api.auth.requestVerification(1);
      toast.success("Verification requested", {
        description: "Our team reviews new accounts within one business day.",
      });
    } catch {
      toast.error("Could not send that request");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-10 grid gap-4 md:grid-cols-2">
      <div className="surface-glass rounded-2xl p-6">
        <div className="font-display text-lg font-semibold">Identity verification</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Status: <span className="text-foreground">{verificationStatus}</span>. Verified accounts
          can bid without limits and list items for sale.
        </p>
        <button
          onClick={verify}
          disabled={busy || verificationStatus === "verified" || verificationStatus === "pending"}
          className="bg-gradient-trust mt-4 rounded-xl px-4 py-2 text-sm font-medium text-trust-foreground disabled:opacity-50"
        >
          {verificationStatus === "verified"
            ? "Verified"
            : verificationStatus === "pending"
              ? "Under review"
              : "Request verification"}
        </button>
      </div>

      <div className="surface-glass rounded-2xl p-6">
        <div className="font-display text-lg font-semibold">Sell on Sabihub</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Turn on selling to create listings, drop items at a hub, and get paid after the buyer
          approves.
        </p>
        <button
          onClick={startSelling}
          disabled={busy || role !== "buyer"}
          className="bg-gradient-primary mt-4 rounded-xl px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {role === "buyer" ? "Start selling" : "Selling enabled"}
        </button>
      </div>
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
    { title: "My listings", desc: "Draft, active, sold. Withdraw any time.", icon: ClipboardList, to: "/listings/new" as const },
    { title: "Create listing", desc: "Upload item video + serial photo.", icon: Gavel, to: "/listings/new" as const },
    { title: "Payouts", desc: "Escrow releases after buyer approval.", icon: ShieldCheck, to: "/orders" as const },
  ];
  const admin = [
    { title: "Verifications", desc: "Review pending NIN/BVN + liveness.", icon: BadgeCheck, to: "/admin" as const },
    { title: "Escrow pipeline", desc: "Funded, inspecting, disputed, released.", icon: ShieldCheck, to: "/admin" as const },
    { title: "Users & hubs", desc: "Manage accounts, freezes, hub network.", icon: Users, to: "/admin" as const },
  ];
  return role === "seller" ? seller : role === "admin" ? admin : buyer;
}
