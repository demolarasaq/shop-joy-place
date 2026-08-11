import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Sabihub" },
      {
        name: "description",
        content:
          "Sabihub's privacy policy: how we collect, use, and protect your data under the Nigeria Data Protection Act (NDPA).",
      },
      { property: "og:title", content: "Privacy Policy — Sabihub" },
      {
        property: "og:description",
        content: "How Sabihub handles your data under NDPA.",
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
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Overview</h2>
            <p className="mt-2">
              Sabihub Technologies Ltd (“Sabihub”, “we”, “us”) operates a trust-first auction
              marketplace for Nigeria. This policy explains how we collect, use, store, and protect
              your personal data in compliance with the Nigeria Data Protection Act (NDPA) 2023.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. What we collect</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Account data: name, email address, phone number.</li>
              <li>Verification data: NIN/BVN reference tokens, liveness-check status, tier level.</li>
              <li>Transaction data: bids, listings, orders, escrow status, dispute records.</li>
              <li>Device and log data: IP address, browser type, access logs for fraud prevention.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. How we use your data</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>To verify identity and prevent fraud.</li>
              <li>To process auctions, escrow, and hub deliveries.</li>
              <li>To communicate order and account updates.</li>
              <li>To improve platform security and user experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Data minimization & partners</h2>
            <p className="mt-2">
              We do not store raw NIN, BVN, or biometric images. Identity verification is performed
              by licensed partners who hold the sensitive payloads under strict NDPA safeguards. We
              store only reference tokens and verification statuses.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Your rights</h2>
            <p className="mt-2">
              You have the right to access, correct, or delete your personal data, and to object to
              certain processing. Contact us at privacy@sabihub.ng to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">6. Cookies & tracking</h2>
            <p className="mt-2">
              We use essential cookies to keep you signed in and remember your theme preference. We
              do not use third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">7. Contact</h2>
            <p className="mt-2">
              Questions about this policy? Email privacy@sabihub.ng or write to Sabihub
              Technologies Ltd, Lagos, Nigeria.
            </p>
          </section>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
