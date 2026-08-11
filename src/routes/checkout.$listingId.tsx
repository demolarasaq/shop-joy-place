import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Copy,
  Landmark,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { api } from "@/lib/api/client";
import { formatNaira } from "@/lib/format";
import { useSession } from "@/lib/api/use-session";
import type { Order } from "@/lib/api/types";

export const Route = createFileRoute("/checkout/$listingId")({
  head: () => ({
    meta: [
      { title: "Checkout — Sabihub" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { listingId } = Route.useParams();
  const session = useSession();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = api.auth.getSession();
    if (!s) {
      navigate({ to: "/auth", search: { redirect: `/checkout/${listingId}` } });
      return;
    }
    api.orders
      .createFromListing(listingId, s.userId)
      .then(setOrder)
      .catch((e: Error) => setError(e.message));
  }, [listingId, navigate]);

  if (error) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <section className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold">Can't start checkout</h1>
          <p className="mt-3 text-muted-foreground">{error}</p>
        </section>
        <SiteFooter />
      </div>
    );
  }

  if (!order || !session) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <section className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          <p className="mt-3 text-sm">Preparing escrow…</p>
        </section>
      </div>
    );
  }

  const simulatePayment = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 900));
    const updated = await api.orders.markPaid(order.id);
    setPaying(false);
    toast.success("Payment confirmed", {
      description: "Funds are now in escrow. Inspect the item before releasing.",
    });
    navigate({ to: "/orders/$id", params: { id: updated.id } });
  };

  const copy = (v: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(v);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-8">
        <Link
          to="/listings/$id"
          params={{ id: order.listingId }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to auction
        </Link>

        <h1 className="mt-6 font-display text-3xl font-semibold md:text-4xl">Complete checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Funds go to a bank-held escrow account, not the seller. Released after you approve the
          item at pickup.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-glass rounded-3xl p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Landmark className="h-3.5 w-3.5" /> Virtual escrow account (mock)
            </div>
            <div className="mt-4 rounded-2xl border border-border bg-surface-elevated/40 p-5">
              <Row label="Bank" value={order.virtualAccountBank} />
              <Row
                label="Account number"
                value={order.virtualAccountNumber}
                onCopy={() => copy(order.virtualAccountNumber)}
                mono
              />
              <Row label="Account name" value={order.virtualAccountName} mono />
              <Row label="Reference" value={order.id} mono />
            </div>

            <div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs text-muted-foreground">
              <div className="mb-1 flex items-center gap-1.5 font-medium text-primary-glow">
                <ShieldCheck className="h-3.5 w-3.5" /> How escrow works
              </div>
              Transfer the exact amount from any Nigerian bank app. We'll detect the payment,
              trigger the seller to drop the item at your chosen hub, and start a 24-hour
              inspection window when you pick it up.
            </div>

            <button
              onClick={simulatePayment}
              disabled={paying}
              className="bg-gradient-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Confirming transfer…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Simulate "I've paid"
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Demo only — no real bank call. Real integration lands with Paystack / Providus later.
            </p>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="text-xs text-muted-foreground">Order summary</div>
              <div className="mt-2 font-display text-lg font-semibold">{order.listingTitle}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Seller {order.sellerName} • Pickup at {order.hubCity} hub
              </div>
              <div className="mt-5 space-y-2 text-sm">
                <Line label="Winning bid" value={formatNaira(order.winningBid)} />
                <Line
                  label="Buyer protection fee (3%)"
                  value={formatNaira(order.buyerProtectionFee)}
                />
                <div className="my-3 border-t border-border" />
                <Line
                  label="Total to escrow"
                  value={formatNaira(order.totalDue)}
                  emphasize
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 text-xs text-muted-foreground">
              <div className="mb-2 flex items-center gap-1.5 font-medium text-foreground">
                <Building2 className="h-3.5 w-3.5 text-primary-glow" /> 0% seller commission
              </div>
              Sellers keep 100% of the winning bid. Our revenue is only the buyer protection fee,
              which funds escrow, hub operations, and dispute resolution.
            </div>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function Row({
  label,
  value,
  onCopy,
  mono,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span className={mono ? "font-mono text-sm" : "text-sm"}>{value}</span>
        {onCopy && (
          <button
            onClick={onCopy}
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Copy ${label}`}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </span>
    </div>
  );
}

function Line({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={emphasize ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
        {label}
      </span>
      <span
        className={
          emphasize
            ? "gradient-text font-mono text-lg font-semibold"
            : "font-mono text-sm"
        }
      >
        {value}
      </span>
    </div>
  );
}
