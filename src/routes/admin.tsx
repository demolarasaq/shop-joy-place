import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  ClipboardList,
  Gavel,
  MapPin,
  ShieldCheck,
  Users,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSession } from "@/lib/api/use-session";
import { api } from "@/lib/api/client";
import { formatNaira } from "@/lib/format";
import type { Order } from "@/lib/api/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — Sabihub" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

const tabs = ["verifications", "escrow", "listings", "users", "hubs"] as const;

type Tab = (typeof tabs)[number];

function Page() {
  const session = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("verifications");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && !api.auth.getSession()) {
      navigate({ to: "/auth", search: { redirect: "/admin" } });
      return;
    }
    api.orders.list().then(setOrders);
  }, [navigate]);

  if (!session) return null;
  if (session.role !== "admin") {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <section className="mx-auto max-w-3xl px-4 py-20 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-warning" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-muted-foreground">
            This console is only available to ops users. Sign in as admin to continue.
          </p>
          <Link
            to="/auth"
            search={{ redirect: "/admin" }}
            className="bg-gradient-primary mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
          >
            Sign in as admin
          </Link>
        </section>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mt-6">
          <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
            Operations
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Admin console</h1>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors " +
                (activeTab === t
                  ? "bg-primary text-primary-foreground"
                  : "surface-glass text-muted-foreground hover:text-foreground")
              }
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "verifications" && <VerificationsTab />}
          {activeTab === "escrow" && <EscrowTab orders={orders} />}
          {activeTab === "listings" && <ListingsTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "hubs" && <HubsTab />}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function VerificationsTab() {
  const requests = [
    { id: "V-001", name: "Tunde M.", type: "BVN + Liveness", status: "pending", submitted: "2 hrs ago" },
    { id: "V-002", name: "Ngozi A.", type: "NIN + Liveness", status: "approved", submitted: "1 day ago" },
    { id: "V-003", name: "Kelechi B.", type: "BVN", status: "rejected", submitted: "3 days ago" },
  ];

  return (
    <div className="surface-glass rounded-2xl p-6">
      <div className="flex items-center gap-2 font-display font-semibold">
        <BadgeCheck className="h-4 w-4 text-primary-glow" /> Verification queue
      </div>
      <div className="mt-4 divide-y divide-border">
        {requests.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-muted-foreground">
                {r.type} • {r.submitted}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={r.status as "pending" | "approved" | "rejected"} />
              {r.status === "pending" && (
                <>
                  <button className="rounded-lg bg-trust/10 p-2 text-trust hover:bg-trust/20">
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg bg-destructive/10 p-2 text-destructive hover:bg-destructive/20">
                    <XCircle className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EscrowTab({ orders }: { orders: Order[] }) {
  const statusIcon: Record<string, React.ReactNode> = {
    awaiting_payment: <Clock className="h-4 w-4" />,
    inspection_window: <ShieldCheck className="h-4 w-4" />,
    released: <CheckCircle2 className="h-4 w-4" />,
    disputed: <AlertCircle className="h-4 w-4" />,
  };

  return (
    <div className="surface-glass rounded-2xl p-6">
      <div className="flex items-center gap-2 font-display font-semibold">
        <ShieldCheck className="h-4 w-4 text-primary-glow" /> Escrow pipeline
      </div>
      <div className="mt-4 divide-y divide-border">
        {orders.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No orders yet. Create one from a listing page to see the pipeline.
          </div>
        )}
        {orders.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <div className="font-medium line-clamp-1">{o.listingTitle}</div>
              <div className="text-sm text-muted-foreground">
                {o.id} • {formatNaira(o.totalDue)} • {o.virtualAccountBank}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary-glow">
                {statusIcon[o.status]} {o.status.replace("_", " ")}
              </span>
              <Link
                to="/orders/$id"
                params={{ id: o.id }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListingsTab() {
  const [listings, setListings] = useState<Awaited<ReturnType<typeof api.listings.list>>>([]);

  useEffect(() => {
    api.listings.list().then(setListings);
  }, []);

  return (
    <div className="surface-glass rounded-2xl p-6">
      <div className="flex items-center gap-2 font-display font-semibold">
        <ClipboardList className="h-4 w-4 text-primary-glow" /> All listings
      </div>
      <div className="mt-4 divide-y divide-border">
        {listings.slice(0, 10).map((l) => (
          <div key={l.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <div className="font-medium line-clamp-1">{l.title}</div>
              <div className="text-sm text-muted-foreground">
                {l.id} • {l.category} • {l.hubCity}
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary-glow uppercase">
                {l.status}
              </span>
              <span className="font-medium">{formatNaira(l.currentBid)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="surface-glass rounded-2xl p-6">
      <div className="flex items-center gap-2 font-display font-semibold">
        <Users className="h-4 w-4 text-primary-glow" /> User management
      </div>
      <div className="mt-4 divide-y divide-border">
        {[
          { name: "Adaeze O.", role: "buyer", tier: 1, status: "active" },
          { name: "Tunde M.", role: "seller", tier: 2, status: "probation" },
          { name: "Ngozi A.", role: "seller", tier: 2, status: "active" },
        ].map((u) => (
          <div key={u.name} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-sm text-muted-foreground">
                {u.role} • Tier {u.tier}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={
                  "rounded-full px-3 py-1 text-xs font-medium uppercase " +
                  (u.status === "active" ? "bg-trust/10 text-trust" : "bg-warning/10 text-warning")
                }
              >
                {u.status}
              </span>
              <button className="rounded-lg border border-border px-3 py-1 text-xs hover:bg-surface">
                Freeze
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HubsTab() {
  return (
    <div className="surface-glass rounded-2xl p-6">
      <div className="flex items-center gap-2 font-display font-semibold">
        <MapPin className="h-4 w-4 text-primary-glow" /> Hub network
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {[
          { city: "Lagos", name: "Yaba Hub", address: "Herbert Macaulay Way", status: "active" },
          { city: "Lagos", name: "Lekki Hub", address: "Admiralty Way, Phase 1", status: "active" },
          { city: "Abuja", name: "Wuse Hub", address: "Aminu Kano Crescent", status: "active" },
          { city: "Port Harcourt", name: "GRA Hub", address: "Aba Road", status: "maintenance" },
          { city: "Ibadan", name: "Bodija Hub", address: "Awolowo Avenue", status: "active" },
          { city: "Kano", name: "Sabon Gari Hub", address: "Fagge District", status: "active" },
        ].map((h) => (
          <div key={h.name} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{h.city}</span>
              <span
                className={
                  "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase " +
                  (h.status === "active" ? "bg-trust/10 text-trust" : "bg-warning/10 text-warning")
                }
              >
                {h.status}
              </span>
            </div>
            <div className="mt-1 font-display font-semibold">{h.name}</div>
            <div className="text-xs text-muted-foreground">{h.address}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles = {
    pending: "bg-warning/10 text-warning",
    approved: "bg-trust/10 text-trust",
    rejected: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}
