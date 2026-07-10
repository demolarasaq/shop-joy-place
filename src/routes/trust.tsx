import { createFileRoute } from "@tanstack/react-router";
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

function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-20">
        <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
          Trust & safety
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
          Safeguards you can actually verify.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Full trust playbook lands with Stage 5 of the build (disputes + admin ops).
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
