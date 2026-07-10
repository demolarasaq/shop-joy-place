import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Gavel,
  Landmark,
  MapPin,
  Camera,
  Timer,
  BadgeCheck,
  PackageCheck,
  KeyRound,
  Percent,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Hero />
      <TrustPillars />
      <HowItWorks />
      <HubTeaser />
      <SellerCTA />
      <FAQ />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="bg-hero relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary to-transparent" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-20 pb-24 md:grid-cols-[1.1fr_0.9fr] md:pt-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-trust" />
            NDPA-registered • CBN partner-bank escrow
          </div>
          <h1 className="mt-6 font-display text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            Auctions Nigerians can <span className="gradient-text">actually trust.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Every seller is identity-verified. Every item is inventory-checked before it goes live.
            Every naira sits in bank-held escrow until you approve the item in your hands.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="bg-gradient-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Get early access <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="surface-glass inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
            >
              See how it works
            </Link>
          </div>
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6">
            {[
              { k: "0%", v: "seller commission" },
              { k: "24 hrs", v: "inspection window" },
              { k: "100%", v: "bank-held escrow" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="font-display text-2xl font-semibold gradient-text">{s.k}</dt>
                <dd className="text-xs text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroCard />
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    <div className="relative">
      <div className="surface-glass shadow-glow rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Live auction</div>
            <div className="font-display text-lg font-semibold">iPhone 15 Pro — 256GB</div>
          </div>
          <span className="bg-gradient-trust rounded-full px-3 py-1 text-xs font-medium text-trust-foreground">
            <BadgeCheck className="mr-1 inline h-3 w-3" /> Verified seller
          </span>
        </div>

        <div className="mt-5 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/25 via-accent/15 to-trust/20 ring-1 ring-border">
          <div className="grid h-full place-items-center text-muted-foreground">
            <Camera className="h-10 w-10 opacity-40" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Stat label="Current bid" value="₦742,000" accent />
          <Stat label="Time left" value="02h 14m" />
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-surface-elevated/60 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-trust" />
            Escrow: <span className="text-foreground">Bank-held until buyer approves</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary-glow" />
            Pickup at <span className="text-foreground">Yaba Hub, Lagos</span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-surface p-3 text-xs shadow-soft md:block">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-warning" />
          <span className="text-muted-foreground">Pickup OTP</span>
          <span className="font-mono font-semibold tracking-widest">482 913</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-elevated/40 p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div
        className={
          "font-display text-lg font-semibold " + (accent ? "gradient-text" : "text-foreground")
        }
      >
        {value}
      </div>
    </div>
  );
}

function TrustPillars() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Verified identity, not just a profile",
      body: "Sellers and high-value bidders complete NIN/BVN + live facial match. No anonymous listings.",
    },
    {
      icon: Landmark,
      title: "Money sits with a partner bank",
      body: "Payments go into a virtual account held by our CBN-licensed partner. We never touch the funds.",
    },
    {
      icon: Timer,
      title: "24-hour, no-questions inspection",
      body: "Escrow only releases after you open the item at pickup and approve — or automatically after 24h.",
    },
    {
      icon: MapPin,
      title: "Hub delivery, not doorstep chaos",
      body: "Sellers drop off, buyers pick up with a one-time OTP at a local partner shop near them.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <SectionHeading eyebrow="Why Sabihub" title="Trust is designed in, not promised." />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {items.map((i) => (
          <div
            key={i.title}
            className="surface-glass rounded-2xl p-6 transition-transform hover:-translate-y-1"
          >
            <div className="bg-gradient-primary inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-glow">
              <i.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="mt-4 font-display text-lg font-semibold">{i.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{i.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: BadgeCheck,
      title: "1 · Verify",
      body: "Register with phone + email. Unlock selling or high-value bidding with a one-time NIN/BVN + liveness check.",
    },
    {
      icon: Gavel,
      title: "2 · List or bid",
      body: "Sellers upload a live video + serial photo. Buyers bid with a small bid-lock to prevent bogus offers.",
    },
    {
      icon: Landmark,
      title: "3 · Pay to escrow",
      body: "The winner pays into a bank-held virtual account. Seller sees “funded”, never sees the money yet.",
    },
    {
      icon: PackageCheck,
      title: "4 · Drop off at a hub",
      body: "Seller drops the item at their nearest hub. It moves to the buyer's chosen hub through our courier batch.",
    },
    {
      icon: KeyRound,
      title: "5 · Pickup with OTP",
      body: "Buyer gets a one-time code, inspects the item on the spot, and approves — or opens a dispute.",
    },
    {
      icon: ShieldCheck,
      title: "6 · Escrow releases",
      body: "On approval (or after 24 hours), the bank releases funds to the seller. Fraud gets caught before payout.",
    },
  ];
  return (
    <section className="border-y border-border/60 bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading
          eyebrow="How it works"
          title="Six steps between listing and payout."
          sub="Every state change is logged. Every payment is reversible until the buyer approves."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-trust flex h-9 w-9 items-center justify-center rounded-lg">
                  <s.icon className="h-4 w-4 text-trust-foreground" />
                </div>
                <div className="font-display font-semibold">{s.title}</div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HubTeaser() {
  const cities = [
    "Lagos · Yaba",
    "Lagos · Lekki",
    "Abuja · Wuse",
    "Port Harcourt · GRA",
    "Ibadan · Bodija",
    "Kano · Sabon Gari",
    "Enugu · Independence",
    "Benin · Ring Road",
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
        <div>
          <SectionHeading
            eyebrow="Hub network"
            title="Delivery through shops you already know."
            sub="No “courier called and left”. Drop off at a hub, pick up when it's convenient — with an OTP handshake at both ends."
          />
          <Link
            to="/hubs"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary-glow hover:text-primary"
          >
            Browse partner hubs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="surface-glass rounded-3xl p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
            {cities.map((c) => (
              <div
                key={c}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated/40 px-3 py-2 text-sm"
              >
                <MapPin className="h-4 w-4 text-primary-glow" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SellerCTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-4">
      <div className="surface-glass shadow-trust relative overflow-hidden rounded-3xl p-10 md:p-14">
        <div className="bg-gradient-trust absolute -top-24 -right-20 h-64 w-64 rounded-full opacity-30 blur-3xl" />
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-trust/15 px-3 py-1 text-xs font-medium text-trust">
              <Percent className="h-3.5 w-3.5" /> 0% commission, ever
            </div>
            <h3 className="mt-4 font-display text-3xl font-semibold md:text-4xl">
              Sell without losing a slice.
            </h3>
            <p className="mt-3 max-w-lg text-muted-foreground">
              The full hammer price goes to you. Buyers pay a single Buyer Protection Fee at
              checkout — that's how the platform stays free for sellers.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Link
              to="/sellers"
              className="bg-gradient-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow"
            >
              Start selling <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-muted-foreground">
              Verification takes about 3 minutes.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    {
      q: "Who holds my money during an auction?",
      a: "A CBN-licensed partner bank. Funds sit in a virtual escrow account tied to your transaction — the platform never has custody.",
    },
    {
      q: "What if the item is not what was described?",
      a: "You have a 24-hour, no-questions inspection window from pickup. Open a dispute and the escrow stays locked until it's resolved.",
    },
    {
      q: "Do I have to verify to just browse?",
      a: "No. Tier 1 lets you browse and buy small items with just phone + email + a bank name-match. Tier 2 (NIN/BVN + liveness) unlocks selling and high-value bidding.",
    },
    {
      q: "Is my ID data safe?",
      a: "We store only references and statuses — not your raw NIN, BVN, or facial scan. The identity partner keeps the sensitive payloads under NDPA safeguards.",
    },
  ];
  return (
    <section className="mx-auto max-w-3xl px-4 py-20">
      <SectionHeading eyebrow="FAQ" title="The questions people ask first." />
      <div className="mt-8 space-y-3">
        {qs.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-border bg-surface p-5 open:bg-surface-elevated"
          >
            <summary className="cursor-pointer list-none font-medium">
              <span className="mr-2 text-primary-glow group-open:text-primary">+</span>
              {f.q}
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
        {eyebrow}
      </div>
      <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}
