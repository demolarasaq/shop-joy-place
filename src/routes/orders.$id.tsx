import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock,
  KeyRound,
  Landmark,
  MapPin,
  Package,
  ShieldCheck,
  Timer,
  Truck,
  Warehouse,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { api } from "@/lib/api/client";
import { formatNaira } from "@/lib/format";
import { useCountdown } from "@/hooks/use-countdown";
import type { EscrowStatus, Order } from "@/lib/api/types";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order — Sabihub" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [reason, setReason] = useState("");
  const [showDispute, setShowDispute] = useState(false);

  const refresh = async () => {
    const o = await api.orders.get(id);
    setOrder(o ?? null);
    setLoaded(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!api.auth.getSession()) {
      navigate({ to: "/auth", search: { redirect: `/orders/${id}` } });
      return;
    }
    refresh();
    const onChange = () => refresh();
    window.addEventListener("sabihub:orders", onChange);
    return () => window.removeEventListener("sabihub:orders", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!loaded) return null;
  if (!order) throw notFound();

  const release = async () => {
    await api.orders.release(order.id);
    refresh();
  };
  const dispute = async () => {
    if (!reason.trim()) return;
    await api.orders.dispute(order.id, reason.trim());
    setShowDispute(false);
    refresh();
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-8">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All orders
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
              Order {order.id}
            </div>
            <h1 className="mt-2 font-display text-2xl font-semibold md:text-3xl">
              {order.listingTitle}
            </h1>
            <div className="mt-1 text-sm text-muted-foreground">
              Seller {order.sellerName} • Pickup at {order.hubCity} hub
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Timeline order={order} />
            <ShipmentTimeline order={order} />

            {order.status === "inspection_window" && order.releaseDueAt && (
              <InspectionPanel
                releaseDueAt={order.releaseDueAt}
                onRelease={release}
                onDispute={() => setShowDispute(true)}
              />
            )}

            {showDispute && (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5">
                <div className="flex items-center gap-2 font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" /> Open a dispute
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Funds stay in escrow while our team reviews the inventory video, serial photo,
                  and your evidence. Typically resolved in 48 hours.
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="What's wrong with the item?"
                  rows={3}
                  className="mt-3 w-full rounded-lg border border-border bg-surface-elevated/60 px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={dispute}
                    disabled={!reason.trim()}
                    className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-50"
                  >
                    Submit dispute
                  </button>
                  <button
                    onClick={() => setShowDispute(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {order.status === "released" && (
              <div className="rounded-2xl border border-trust/40 bg-trust/10 p-5">
                <div className="flex items-center gap-2 font-medium text-trust">
                  <CheckCircle2 className="h-4 w-4" /> Funds released to seller
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNaira(order.winningBid)} paid out. Rate your experience so other buyers
                  can trust this seller.
                </p>
              </div>
            )}

            {order.status === "disputed" && (
              <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5">
                <div className="flex items-center gap-2 font-medium text-warning">
                  <AlertTriangle className="h-4 w-4" /> Dispute under review
                </div>
                {order.disputeReason && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your note: "{order.disputeReason}"
                  </p>
                )}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="surface-glass rounded-2xl p-5">
              <div className="text-xs text-muted-foreground">Amounts</div>
              <div className="mt-3 space-y-2 text-sm">
                <Line label="Winning bid" value={formatNaira(order.winningBid)} />
                <Line
                  label="Buyer protection fee"
                  value={formatNaira(order.buyerProtectionFee)}
                />
                <div className="my-3 border-t border-border" />
                <Line label="Total in escrow" value={formatNaira(order.totalDue)} emphasize />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 text-sm">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary-glow" />
                <span className="text-muted-foreground">Escrow account</span>
                <span className="ml-auto font-mono text-xs">{order.virtualAccountNumber}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-glow" />
                <span className="text-muted-foreground">Pickup hub</span>
                <span className="ml-auto font-medium">{order.hubCity}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary-glow" />
                <span className="text-muted-foreground">Pickup OTP</span>
                <span className="ml-auto font-mono text-xs">
                  {order.status === "inspection_window" || order.status === "released"
                    ? "492 118"
                    : "issued at hub"}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function InspectionPanel({
  releaseDueAt,
  onRelease,
  onDispute,
}: {
  releaseDueAt: string;
  onRelease: () => void;
  onDispute: () => void;
}) {
  const t = useCountdown(releaseDueAt);
  return (
    <div className="surface-glass shadow-glow rounded-2xl p-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Timer className="h-3.5 w-3.5" /> Inspection window
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className="gradient-text font-display text-3xl font-semibold">
          {t.ended ? "Auto-released" : t.label}
        </div>
        {!t.ended && <div className="text-xs text-muted-foreground">until auto-release</div>}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Inspect the item at the hub. If everything checks out, release funds now. If something's
        wrong, open a dispute before the timer runs out.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={onRelease}
          className="bg-gradient-trust inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-trust-foreground shadow-glow"
        >
          <CheckCircle2 className="h-4 w-4" /> Release funds now
        </button>
        <button
          onClick={onDispute}
          className="inline-flex items-center gap-2 rounded-xl border border-destructive/50 px-5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          <AlertTriangle className="h-4 w-4" /> Open dispute
        </button>
      </div>
    </div>
  );
}

function Timeline({ order }: { order: Order }) {
  const steps: { key: EscrowStatus; label: string; at?: string; icon: typeof Clock }[] = [
    { key: "awaiting_payment", label: "Awaiting payment", at: order.createdAt, icon: Clock },
    { key: "inspection_window", label: "Funded • inspection window", at: order.fundedAt, icon: ShieldCheck },
    {
      key: order.status === "disputed" ? "disputed" : "released",
      label: order.status === "disputed" ? "Disputed" : "Released to seller",
      at: order.releasedAt ?? order.disputedAt,
      icon: order.status === "disputed" ? AlertTriangle : BadgeCheck,
    },
  ];
  const activeIdx =
    order.status === "awaiting_payment"
      ? 0
      : order.status === "inspection_window"
        ? 1
        : 2;

  return (
    <div className="surface-glass rounded-2xl p-6">
      <div className="font-display text-lg font-semibold">Order timeline</div>
      <ol className="mt-4 space-y-4">
        {steps.map((s, i) => {
          const done = i < activeIdx;
          const active = i === activeIdx;
          return (
            <li key={i} className="flex items-start gap-3">
              <div
                className={
                  "mt-0.5 grid h-8 w-8 place-items-center rounded-full border " +
                  (done
                    ? "border-trust/40 bg-trust/20 text-trust"
                    : active
                      ? "border-primary/50 bg-primary/20 text-primary-glow"
                      : "border-border bg-surface text-muted-foreground")
                }
              >
                <s.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className={"text-sm " + (active ? "font-semibold" : "font-medium")}>
                  {s.label}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {s.at ? new Date(s.at).toLocaleString() : "—"}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ShipmentTimeline({ order }: { order: Order }) {
  const steps = [
    { key: "seller_dropoff", label: "Seller dropped off at hub", icon: Warehouse },
    { key: "courier_batch", label: "Courier batch to buyer hub", icon: Truck },
    { key: "hub_arrival", label: "Arrived at buyer hub", icon: Package },
    { key: "otp_pickup", label: "OTP pickup confirmed", icon: KeyRound },
  ];

  const activeIdx =
    order.status === "awaiting_payment"
      ? -1
      : order.status === "inspection_window" || order.status === "released" || order.status === "disputed"
        ? 3
        : 1;

  return (
    <div className="surface-glass rounded-2xl p-6">
      <div className="font-display text-lg font-semibold">Shipment timeline</div>
      <ol className="mt-4 space-y-4">
        {steps.map((s, i) => {
          const done = i <= activeIdx;
          const active = i === activeIdx;
          return (
            <li key={s.key} className="flex items-start gap-3">
              <div
                className={
                  "mt-0.5 grid h-8 w-8 place-items-center rounded-full border " +
                  (done
                    ? active
                      ? "border-primary/50 bg-primary/20 text-primary-glow"
                      : "border-trust/40 bg-trust/20 text-trust"
                    : "border-border bg-surface text-muted-foreground")
                }
              >
                <s.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className={"text-sm " + (active ? "font-semibold" : "font-medium")}>
                  {s.label}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {done ? (active ? "Ready for pickup" : "Completed") : "Pending"}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StatusBadge({ status }: { status: EscrowStatus }) {
  const map: Record<EscrowStatus, { label: string; cls: string }> = {
    awaiting_payment: { label: "Awaiting payment", cls: "bg-warning/20 text-warning" },
    funded: { label: "Funded", cls: "bg-primary/20 text-primary-glow" },
    inspection_window: {
      label: "Inspecting",
      cls: "bg-primary/20 text-primary-glow",
    },
    released: { label: "Released", cls: "bg-trust/20 text-trust" },
    disputed: { label: "Disputed", cls: "bg-destructive/20 text-destructive" },
    refunded: { label: "Refunded", cls: "bg-muted text-muted-foreground" },
  };
  const s = map[status];
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>
  );
}

function Line({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={emphasize ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
        {label}
      </span>
      <span className={emphasize ? "gradient-text font-mono text-lg font-semibold" : "font-mono text-sm"}>
        {value}
      </span>
    </div>
  );
}
