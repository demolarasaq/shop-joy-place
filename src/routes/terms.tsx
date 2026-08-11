import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Sabihub" },
      {
        name: "description",
        content:
          "Sabihub's terms of service for buyers and sellers using the trust-first auction marketplace.",
      },
      { property: "og:title", content: "Terms of Service — Sabihub" },
      {
        property: "og:description",
        content: "Terms governing buyer and seller use of Sabihub.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
          Legal
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Terms of Service</h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Acceptance</h2>
            <p className="mt-2">
              By accessing or using Sabihub, you agree to be bound by these Terms of Service and our
              Privacy Policy. If you do not agree, do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Eligibility</h2>
            <p className="mt-2">
              You must be at least 18 years old and legally able to enter into contracts. Sellers
              and high-value bidders must complete Tier 2 verification.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. Auctions & bidding</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>All bids are binding once placed.</li>
              <li>A bid-lock amount may be held on a verified payment method.</li>
              <li>Winning bidders must complete checkout and escrow payment within the stated window.</li>
              <li>Failure to pay may result in forfeiture of the bid-lock and account suspension.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Selling</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Listings must accurately describe the item, including defects.</li>
              <li>Sellers must provide a live inventory video and serial/IMEI photo.</li>
              <li>Prohibited items include counterfeit goods, stolen property, and illegal products.</li>
              <li>New sellers are subject to a 30-day probation and listing value cap.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Escrow & inspection</h2>
            <p className="mt-2">
              Buyer payments go into a bank-held escrow account. Funds release to the seller after
              buyer approval or automatically 24 hours after OTP-confirmed pickup. Disputes opened
              within the inspection window pause release until resolved.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">6. Fees</h2>
            <p className="mt-2">
              Sabihub charges sellers 0% commission. Buyers pay a Buyer Protection Fee shown at
              checkout. We reserve the right to adjust fees with notice.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">7. Disputes & suspensions</h2>
            <p className="mt-2">
              We may suspend accounts for fraud, misrepresentation, repeated no-shows, or
              violations of these terms. Disputes are resolved by Sabihub ops based on listing
              evidence and buyer/seller submissions.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">8. Limitation of liability</h2>
            <p className="mt-2">
              Sabihub is a coordination platform. We are not a party to the sale. Our liability is
              limited to the extent permitted by Nigerian law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">9. Governing law</h2>
            <p className="mt-2">
              These terms are governed by the laws of the Federal Republic of Nigeria. Disputes shall
              be resolved in the courts of Lagos State.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">10. Contact</h2>
            <p className="mt-2">
              For legal inquiries, email legal@sabihub.ng or write to Sabihub Technologies Ltd,
              Lagos, Nigeria.
            </p>
          </section>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
