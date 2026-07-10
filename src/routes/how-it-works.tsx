import { createFileRoute } from "@tanstack/react-router";
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

function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-20">
        <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
          How it works
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
          Every auction, six trust checkpoints.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Detailed walkthrough coming as part of Stage 2 of the build. For now, see the summary on
          the home page.
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
