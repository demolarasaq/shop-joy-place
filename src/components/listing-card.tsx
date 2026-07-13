import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, PlayCircle, Timer } from "lucide-react";
import type { Listing } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";
import { useCountdown } from "@/hooks/use-countdown";

export function ListingCard({ listing }: { listing: Listing }) {
  const t = useCountdown(listing.endsAt);
  const cover = listing.images[0];

  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="surface-glass group flex flex-col overflow-hidden rounded-2xl transition-transform hover:-translate-y-1"
    >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, oklch(0.45 0.18 ${listing.coverColor.split(" ")[0]}) 0%, oklch(0.28 0.06 265) 100%)`,
        }}
      >
        {cover && (
          <img
            src={cover}
            alt={listing.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/10" />
        <div className="absolute top-3 left-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-medium text-foreground backdrop-blur">
          {listing.category}
        </div>
        {listing.videoUrl && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-[10px] font-medium text-foreground backdrop-blur">
            <PlayCircle className="h-3 w-3" /> Video
          </div>
        )}
        <div
          className={
            "absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium backdrop-blur " +
            (t.urgent
              ? "bg-destructive/80 text-destructive-foreground"
              : "bg-background/80 text-foreground")
          }
        >
          <Timer className="h-3 w-3" /> {t.label}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="line-clamp-2 font-display font-semibold">{listing.title}</div>

        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <div className="text-[11px] text-muted-foreground">Current bid</div>
            <div className="gradient-text font-display text-xl font-semibold">
              {formatNaira(listing.currentBid)}
            </div>
          </div>
          <div className="text-right text-[11px] text-muted-foreground">
            {listing.bidCount} bids
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BadgeCheck className="h-3.5 w-3.5 text-trust" />
            {listing.sellerName}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary-glow" />
            {listing.hubCity}
          </span>
        </div>
      </div>
    </Link>
  );
}
