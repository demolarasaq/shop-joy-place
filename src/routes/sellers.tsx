import { createFileRoute } from "@tanstack/react-router";
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

function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-20">
        <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
          For sellers
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
          Zero commission. Full hammer price.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Onboarding flow ships with Stage 1 (mocked NIN/BVN + liveness).
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
