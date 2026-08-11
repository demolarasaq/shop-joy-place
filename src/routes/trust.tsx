import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Landmark,
  UserCheck,
  Scale,
  Lock,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust & safety — Sabihub" },
      {
        name: "description",
        content:
          "How Sabihub protects buyers and sellers: NDPA-compliant identity checks, bank-held escrow, hub OTP handoff, and dispute resolution.",
      },
      { property: "og:title", content: "Trust & safety at Sabihub" },
      {
        property: "og:description",
        content: "NDPA-safe identity, bank escrow, hub OTP, and dispute resolution.",
      },
    ],
  }),
  component: Page,
});

const pillars = [
  {
    icon: UserCheck,
    title: "Verified identity, not just a profile",
    body: "Sellers and high-value bidders complete NIN/BVN + live facial match. We store only reference tokens and statuses; the identity partner keeps raw biometric and ID payloads under NDPA safeguards.",
  },
  {
    icon: Landmark,
    title: "Money sits with a partner bank",
    body: "Payments go into a virtual escrow account held by a CBN-licensed partner. Sabihub never takes custody of buyer funds. Release happens only on buyer approval or after the 24-hour inspection window.",
  },
  {
    icon: MapPin,
    title: "Hub delivery, not doorstep chaos",
    body: "Sellers drop off at a partner hub; buyers pick up at their chosen hub with a one-time OTP. Items are physically checked at both ends, and handoff is provable.",
  },
  {
    icon: Scale,
    title: "Disputes before payout",
    body: "If an item doesn't match, the buyer opens a dispute during the inspection window. Funds stay locked while our ops team reviews the listing video, serial photo, and buyer evidence.",
  },
  {
    icon: Lock,
    title: "NDPA by design",
    body: "We collect the minimum data needed to coordinate a trade. Sensitive identity data is tokenized, encrypted in transit, and never sold or shared for marketing.",
  },
  {
    icon: ShieldCheck,
    title: "Probation for new sellers",
    body: "Newly verified sellers enter a 30-day probation with a ₦100,000 listing cap. Limits lift automatically as successful trades accumulate.",
  },
];

const tiers = [
  {
    name: "Tier 1",
    for: "Buyers / small-value bidding",
    req: "Phone + email + bank account name match",
    limit: "Browse and buy items below the high-value threshold.",
  },
  {
    name: "Tier 2",
    for: "Sellers / high-value bidders",
    req: "NIN or BVN + live facial match + ₦500 verification charge",
    limit: "List items and bid above the high-value threshold. Subject to 30-day probation.",
  },
];

function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="border-b border-border/60 bg-hero">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
            Trust & safety
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
            Safeguards you can actually verify.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Trust isn't a marketing line here. It's built into identity, escrow, delivery, and
            dispute design.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="surface-glass rounded-2xl p-6">
              <div className="bg-gradient-trust inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-glow">
                <p.icon className="h-5 w-5 text-trust-foreground" />
              </div>
              <div className="mt-4 font-display text-lg font-semibold">{p.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">Verification tiers</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Different trust levels unlock different actions. Everyone starts at Tier 1; Tier 2 is
            required to sell or bid on high-value items.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {tiers.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-surface p-6">
                <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-glow">
                  {t.name}
                </div>
                <div className="mt-3 font-display text-lg font-semibold">{t.for}</div>
                <div className="mt-4 space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Requirement:</span>{" "}
                    <span className="text-foreground">{t.req}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">What you can do:</span>{" "}
                    <span className="text-foreground">{t.limit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-3xl border border-trust/30 bg-trust/5 p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                Still have questions?
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Read the step-by-step flow or browse the hub network to see where pickups happen.
              </p>
            </div>
            <Link
              to="/how-it-works"
              className="bg-gradient-trust inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-trust-foreground shadow-glow"
            >
              See the flow <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
