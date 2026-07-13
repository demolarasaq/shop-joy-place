import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  Gavel,
  KeyRound,
  Landmark,
  MapPin,
  PlayCircle,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { api } from "@/lib/api/client";
import { formatNaira } from "@/lib/format";
import { useCountdown } from "@/hooks/use-countdown";
import { useSession } from "@/lib/api/use-session";

export const Route = createFileRoute("/listings/$id")({
  loader: async ({ params }) => {
    const listing = await api.listings.get(params.id);
    if (!listing) throw notFound();
    return { listing };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Auction unavailable — Sabihub" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const l = loaderData.listing;
    const desc = `${l.title} — current bid ${formatNaira(l.currentBid)}. Verified seller, bank-held escrow, pickup at ${l.hubCity}.`;
    return {
      meta: [
        { title: `${l.title} — Sabihub auction` },
        { name: "description", content: desc },
        { property: "og:title", content: l.title },
        { property: "og:description", content: desc },
      ],
    };
  },
  notFoundComponent: ListingNotFound,
  component: ListingDetail,
});

function ListingNotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-semibold">Auction not found</h1>
        <p className="mt-3 text-muted-foreground">
          It may have ended or been withdrawn. Browse what's still live.
        </p>
        <Link
          to="/browse"
          className="bg-gradient-primary mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow"
        >
          Browse auctions
        </Link>
      </section>
      <SiteFooter />
    </div>
  );
}

function ListingDetail() {
  const { listing: initial } = Route.useLoaderData();
  const { data: listing = initial } = useQuery({
    queryKey: ["listings", initial.id],
    queryFn: () => api.listings.get(initial.id).then((l) => l ?? initial),
    initialData: initial,
  });
  const t = useCountdown(listing.endsAt);
  const session = useSession();
  const navigate = useNavigate();

  const minBid = listing.currentBid + 5000;
  const [bidAmount, setBidAmount] = useState<number>(minBid);
  const [placed, setPlaced] = useState<{ amount: number } | null>(null);

  const bids = mockBidHistory(listing.currentBid, listing.bidCount);

  const canBid = session && !t.ended;

  const placeBid = () => {
    if (!session) {
      navigate({ to: "/auth", search: { redirect: `/listings/${listing.id}` } });
      return;
    }
    if (bidAmount < minBid) return;
    setPlaced({ amount: bidAmount });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to auctions
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <MediaGallery listing={listing} />


            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <TrustTile icon={ShieldCheck} label="Escrow" value="Bank-held" tone="trust" />
              <TrustTile icon={Landmark} label="Inspection" value="24 hrs" />
              <TrustTile icon={KeyRound} label="Pickup" value="OTP at hub" />
            </div>

            <div className="mt-8 surface-glass rounded-2xl p-6">
              <div className="font-display text-lg font-semibold">Bid history</div>
              <div className="mt-4 divide-y divide-border">
                {bids.map((b, i) => (
                  <div key={i} className="flex items-center justify-between py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-elevated text-[10px] font-medium">
                        {b.bidder.slice(0, 2)}
                      </span>
                      <span className="text-muted-foreground">{b.bidder}</span>
                      {i === 0 && (
                        <span className="rounded-full bg-trust/20 px-2 py-0.5 text-[10px] font-medium text-trust">
                          Winning
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold">{formatNaira(b.amount)}</div>
                      <div className="text-[10px] text-muted-foreground">{b.when}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="surface-glass shadow-glow rounded-3xl p-6">
              <div className="text-xs text-muted-foreground">{listing.category}</div>
              <h1 className="mt-1 font-display text-2xl font-semibold md:text-3xl">
                {listing.title}
              </h1>

              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="bg-gradient-trust inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium text-trust-foreground">
                  <BadgeCheck className="h-3 w-3" /> Verified seller
                </span>
                <span className="text-muted-foreground">{listing.sellerName}</span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-surface-elevated/40 p-4">
                  <div className="text-[11px] text-muted-foreground">Current bid</div>
                  <div className="gradient-text mt-1 font-display text-2xl font-semibold">
                    {formatNaira(listing.currentBid)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Reserve {formatNaira(listing.reservePrice)}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-surface-elevated/40 p-4">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Timer className="h-3 w-3" /> Time left
                  </div>
                  <div
                    className={
                      "mt-1 font-display text-2xl font-semibold " +
                      (t.urgent ? "text-destructive" : "text-foreground")
                    }
                  >
                    {t.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{listing.bidCount} bids</div>
                </div>
              </div>

              {placed ? (
                <div className="mt-6 rounded-2xl border border-trust/40 bg-trust/10 p-4 text-sm">
                  <div className="font-medium text-trust">
                    Bid placed: {formatNaira(placed.amount)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    A bid-lock of ₦{Math.round(placed.amount * 0.05).toLocaleString()} is held on your
                    account. Released if you don't win, forfeited if you win and don't pay.
                  </p>
                </div>
              ) : null}

              <div className="mt-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-xs">
                <div className="text-muted-foreground">Demo shortcut — jump to escrow</div>
                <Link
                  to="/checkout/$listingId"
                  params={{ listingId: listing.id }}
                  className="mt-1 inline-flex items-center gap-1 font-medium text-primary-glow hover:text-primary"
                >
                  Simulate winning → Checkout →
                </Link>
              </div>

                <div className="mt-6">
                  <label className="text-xs text-muted-foreground">
                    Your bid (min {formatNaira(minBid)})
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      step={1000}
                      min={minBid}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-surface-elevated/60 px-3 py-2.5 font-mono text-sm outline-none focus:border-primary"
                    />
                    <button
                      onClick={placeBid}
                      disabled={!canBid || bidAmount < minBid}
                      className="bg-gradient-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      <Gavel className="h-4 w-4" /> {session ? "Place bid" : "Sign in to bid"}
                    </button>
                  </div>
                  {t.ended && (
                    <p className="mt-2 text-xs text-destructive">This auction has ended.</p>
                  )}
                </div>

            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-glow" />
                <span className="text-muted-foreground">Pickup hub</span>
                <span className="ml-auto font-medium">{listing.hubCity}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-trust" />
                <span className="text-muted-foreground">Buyer protection fee</span>
                <span className="ml-auto font-medium">
                  {formatNaira(Math.round(listing.currentBid * 0.03))}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Fee is added at checkout and funds our escrow, hub network, and dispute team. Sellers
                pay 0%.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function TrustTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  tone?: "trust";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div
        className={
          "inline-flex h-8 w-8 items-center justify-center rounded-lg " +
          (tone === "trust" ? "bg-gradient-trust" : "bg-gradient-primary")
        }
      >
        <Icon
          className={
            "h-4 w-4 " + (tone === "trust" ? "text-trust-foreground" : "text-primary-foreground")
          }
        />
      </div>
      <div className="mt-3 text-[11px] text-muted-foreground">{label}</div>
      <div className="font-display text-sm font-semibold">{value}</div>
    </div>
  );
}

function mockBidHistory(current: number, count: number) {
  const names = ["Ada", "Tunde", "Ngozi", "Kelechi", "Amina", "Ifeanyi", "Chidi", "Bola", "Zainab"];
  const rows: { bidder: string; amount: number; when: string }[] = [];
  let amt = current;
  const now = Date.now();
  for (let i = 0; i < Math.min(count, 8); i++) {
    rows.push({
      bidder: names[i % names.length] + " " + String.fromCharCode(65 + ((i * 3) % 26)) + ".",
      amount: amt,
      when: relativeTime(now - i * (7 * 60 * 1000 + i * 60_000)),
    });
    amt = Math.max(0, amt - (5000 + Math.floor(Math.random() * 15000)));
  }
  return rows;
}

function relativeTime(then: number) {
  const s = Math.floor((Date.now() - then) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}
