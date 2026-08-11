import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Gavel,
  Landmark,
  PackageCheck,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Sabihub works — Verified sellers, escrow & hub delivery" },
      {
        name: "description",
        content:
          "Six-step trust flow: verify, list or bid, pay to bank escrow, drop off at a hub, pickup with OTP, escrow releases.",
      },
      { property: "og:title", content: "How Sabihub works" },
      {
        property: "og:description",
        content: "The six-step trust flow behind every Sabihub auction.",
      },
    ],
  }),
  component: Page,
});

const steps = [
  {
    icon: UserCheck,
    title: "Verify your identity",
    body: "Register with phone + email. To sell or bid high-value items, complete a one-time NIN/BVN check plus a live facial match. We store only a reference token — the identity partner holds the raw data under NDPA safeguards.",
  },
  {
    icon: Gavel,
    title: "List or bid",
    body: "Sellers upload a live inventory video and a clear serial/IMEI photo, set a reserve price, and choose a pickup hub. Buyers browse verified listings and place bids with a small bid-lock to keep offers serious.",
  },
  {
    icon: Landmark,
    title: "Pay into escrow",
    body: "The winning buyer pays into a CBN-licensed partner-bank virtual account tied to the transaction. The platform never touches the funds. The seller sees 'funded' but can't access the money yet.",
  },
  {
    icon: PackageCheck,
    title: "Drop off at a hub",
    body: "The seller drops the item at their chosen Sabihub partner hub. Staff confirm the serial/IMEI against the listing record and hand the package to our courier batch.",
  },
  {
    icon: KeyRound,
    title: "Pickup with OTP",
    body: "When the item reaches the buyer's hub, the buyer receives a one-time pickup code. They inspect the item on the spot before approving or opening a dispute.",
  },
  {
    icon: ShieldCheck,
    title: "Escrow releases",
    body: "Once the buyer approves — or 24 hours after pickup if no dispute is raised — the bank releases the full hammer price to the seller. Sellers keep 100%; the buyer pays only the protection fee.",
  },
];

function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="border-b border-border/60 bg-hero">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
            How it works
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
            Six checkpoints. One trusted trade.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Every Sabihub auction follows the same state machine: identity → listing → escrow → hub
            → OTP → release. No step is skipped, and every transition is logged.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="surface-glass rounded-2xl p-6">
              <div className="bg-gradient-primary inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-glow">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="font-display text-lg font-semibold">{s.title}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              <div className="mt-4 text-xs font-medium text-primary-glow">Step {i + 1} of 6</div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-surface p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                Ready to see it in action?
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Browse live auctions, simulate a bid, and walk through escrow checkout with a demo
                account.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/browse"
                className="bg-gradient-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow"
              >
                Browse auctions <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/sellers"
                className="surface-glass inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
              >
                Start selling
              </Link>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
