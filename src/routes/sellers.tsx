import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Percent,
  BadgeCheck,
  Camera,
  MapPin,
  ShieldCheck,
  Gavel,
  ArrowRight,
  Landmark,
  PackageCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/sellers")({
  head: () => ({
    meta: [
      { title: "Sell on Sabihub — 0% commission auctions" },
      {
        name: "description",
        content:
          "Keep the full hammer price. Verified sellers reach trust-first buyers across Nigeria with bank escrow and hub drop-off.",
      },
      { property: "og:title", content: "Sell on Sabihub — 0% commission" },
      {
        property: "og:description",
        content: "Keep the full hammer price. Reach verified buyers nationwide.",
      },
    ],
  }),
  component: Page,
});

const benefits = [
  {
    icon: Percent,
    title: "0% seller commission",
    body: "You keep the entire hammer price. The buyer pays a single Buyer Protection Fee at checkout — that's how the platform funds escrow, hubs, and dispute resolution.",
  },
  {
    icon: BadgeCheck,
    title: "Verified buyers only",
    body: "High-value bidders complete NIN/BVN + liveness. That means fewer time-wasters and fewer failed pickups.",
  },
  {
    icon: Camera,
    title: "Inventory proof built in",
    body: "Upload a live video and a clear serial/IMEI photo when listing. Buyers trust what they see, and disputes are resolved faster with evidence on file.",
  },
  {
    icon: MapPin,
    title: "Drop off at a hub near you",
    body: "No chasing couriers. Drop the item at your local Sabihub partner hub; we handle batch movement to the buyer's hub.",
  },
  {
    icon: Landmark,
    title: "Bank-held escrow",
    body: "The buyer pays into a CBN-licensed partner-bank virtual account. Funds release to you only after buyer approval or the 24-hour inspection window closes.",
  },
  {
    icon: ShieldCheck,
    title: "Dispute protection",
    body: "If a buyer raises a dispute, our ops team reviews the listing evidence before any funds move. Sellers can also dispute bogus claims.",
  },
];

const steps = [
  { icon: BadgeCheck, title: "Verify to Tier 2", body: "NIN/BVN + liveness check (mocked for now)." },
  { icon: Camera, title: "Create a listing", body: "Add title, category, reserve price, hub, video + serial photo." },
  { icon: Gavel, title: "Run the auction", body: "Buyers bid; the highest bidder wins when the timer closes." },
  { icon: PackageCheck, title: "Drop off at hub", body: "Take the item to your chosen hub for physical check and handoff." },
  { icon: ShieldCheck, title: "Get paid", body: "Buyer approves after pickup; escrow releases to your bank account." },
];

function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="border-b border-border/60 bg-hero">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
            For sellers
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
            Sell more. Keep everything.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Sabihub is free for sellers. Buyers pay the protection fee. You get verified buyers,
            bank-held escrow, and hub-based delivery.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="bg-gradient-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow"
            >
              Start selling <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="surface-glass inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">Why sellers choose Sabihub</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="surface-glass rounded-2xl p-6">
              <div className="bg-gradient-trust inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-glow">
                <b.icon className="h-5 w-5 text-trust-foreground" />
              </div>
              <div className="mt-4 font-display text-lg font-semibold">{b.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">How selling works</h2>
          <div className="mt-8 space-y-4">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5"
              >
                <div className="bg-gradient-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-glow">
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-display font-semibold">
                    {i + 1}. {s.title}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-surface p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                Ready to list your first item?
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Sign in as a demo seller to create a listing and see the seller dashboard.
              </p>
            </div>
            <Link
              to="/auth"
              className="bg-gradient-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow"
            >
              Create a listing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
