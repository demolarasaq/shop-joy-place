import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PackageOpen, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { api } from "@/lib/api/client";
import { formatNaira } from "@/lib/format";
import type { EscrowStatus, Order } from "@/lib/api/types";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My orders — Sabihub" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersList,
});

const statusLabel: Record<EscrowStatus, string> = {
  awaiting_payment: "Awaiting payment",
  funded: "Funded",
  inspection_window: "Inspecting",
  released: "Released",
  disputed: "Disputed",
  refunded: "Refunded",
};

function OrdersList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const load = () =>
      api.orders.list().then((o) => {
        setOrders(o);
        setLoaded(true);
      });
    api.auth.ready().then((s) => {
      if (!s) {
        navigate({ to: "/auth", search: { redirect: "/orders" } });
        return;
      }
      load();
    });
    window.addEventListener("sabihub:orders", load);
    return () => window.removeEventListener("sabihub:orders", load);
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
              Escrow & pickup
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">My orders</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Every order sits in bank-held escrow until you approve it at the hub.
            </p>
          </div>
          <ShieldCheck className="h-10 w-10 text-primary-glow opacity-60" />
        </div>

        {loaded && orders.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border p-10 text-center">
            <PackageOpen className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="mt-3 font-display text-lg font-semibold">No orders yet</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Win an auction — or jump into one now to see the escrow flow.
            </p>
            <Link
              to="/browse"
              className="bg-gradient-primary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
            >
              Browse auctions
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-3">
            {orders.map((o) => (
              <Link
                key={o.id}
                to="/orders/$id"
                params={{ id: o.id }}
                className="surface-glass grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-mono">{o.id}</span>
                    <span>•</span>
                    <span>{o.hubCity}</span>
                  </div>
                  <div className="mt-1 truncate font-display text-base font-semibold">
                    {o.listingTitle}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {statusLabel[o.status]} • {new Date(o.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="gradient-text font-mono text-lg font-semibold">
                    {formatNaira(o.totalDue)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">in escrow</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
