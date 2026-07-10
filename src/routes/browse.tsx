import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingCard } from "@/components/listing-card";
import { api } from "@/lib/api/client";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse live auctions — Sabihub" },
      {
        name: "description",
        content:
          "Browse live auctions from verified Nigerian sellers. Bank-held escrow, hub pickup, and 24-hour inspection on every purchase.",
      },
      { property: "og:title", content: "Browse live auctions — Sabihub" },
      {
        property: "og:description",
        content: "Verified sellers, bank-held escrow, hub pickup with OTP.",
      },
    ],
  }),
  component: BrowsePage,
});

const sortOptions = [
  { id: "ending", label: "Ending soon" },
  { id: "new", label: "Newest" },
  { id: "price-low", label: "Price: low to high" },
  { id: "price-high", label: "Price: high to low" },
] as const;

type SortId = (typeof sortOptions)[number]["id"];

function BrowsePage() {
  const { data: listings = [] } = useQuery({
    queryKey: ["listings"],
    queryFn: () => api.listings.list(),
  });

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [city, setCity] = useState<string>("All");
  const [sort, setSort] = useState<SortId>("ending");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(listings.map((l) => l.category)))],
    [listings],
  );
  const cities = useMemo(
    () => ["All", ...Array.from(new Set(listings.map((l) => l.hubCity)))],
    [listings],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = listings.filter((l) => {
      if (category !== "All" && l.category !== category) return false;
      if (city !== "All" && l.hubCity !== city) return false;
      if (q && !l.title.toLowerCase().includes(q)) return false;
      return true;
    });
    out = [...out].sort((a, b) => {
      switch (sort) {
        case "ending":
          return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime();
        case "new":
          return b.id.localeCompare(a.id);
        case "price-low":
          return a.currentBid - b.currentBid;
        case "price-high":
          return b.currentBid - a.currentBid;
      }
    });
    return out;
  }, [listings, query, category, city, sort]);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="border-b border-border/60 bg-hero">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
            Live auctions
          </div>
          <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">
            Browse what's <span className="gradient-text">on the block.</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Every listing has been inventory-checked at a hub. Bid with confidence — funds sit in
            bank-held escrow until you approve at pickup.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="surface-glass rounded-2xl p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search phones, watches, drones…"
                className="w-full rounded-lg border border-border bg-surface-elevated/60 py-2.5 pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <Select label="Category" value={category} onChange={setCategory} options={categories} />
            <Select label="Hub city" value={city} onChange={setCity} options={cities} />

            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortId)}
                className="rounded-lg border border-border bg-surface-elevated/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs text-muted-foreground">
          {filtered.length} auction{filtered.length === 1 ? "" : "s"}
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No auctions match those filters yet.
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface-elevated/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
