# Trust-First Marketplace — Build Plan

A mobile-first auction & marketplace app for Nigeria, built end-to-end in Lovable with all external integrations mocked. Purple / navy blue / deep green palette, modern NextUI-inspired feel.

## Guiding principles (from your docs)
- Platform is a **coordination layer**: DB stores *statuses & references*, never raw NIN/BVN/biometric payloads (mocked as tokens).
- **State machines** for Listing, Auction, EscrowTransaction, Shipment, Dispute — every transition logged.
- **Tiered trust**: Tier 1 (browse/buy small), Tier 2 (sell / high-value bid), 30-day probation cap.
- **0% seller commission**, revenue = Buyer Protection Fee at checkout.
- **Bank-held escrow** (mocked virtual accounts) with 24-hour inspection window auto-release.
- **Hub-based delivery** with OTP handoff (mocked).

## Stage 0 — Foundation (this iteration)
1. Design system in `src/styles.css` — purple primary, navy surfaces, deep green success/escrow-safe accent, oklch tokens, gradients, elevation, radii.
2. Root layout, header w/ session-aware nav, footer, mobile bottom-nav.
3. Marketing landing route `/` explaining the trust model (hero, how-it-works, trust pillars, hub map teaser, FAQ, CTA).
4. Sitemap, robots, real head metadata.

## Stage 1 — Auth & Verification (mocked)
- Lovable Cloud on. `profiles` + `user_roles` (admin/ops/user) + separate `verifications`, `bank_accounts` tables.
- Email/password auth, `/auth` route.
- Tier 1 onboarding: phone + email + mock bank-account name-match.
- Tier 2 upgrade flow: choose NIN or BVN → mock ₦500 charge screen → mock liveness capture (camera placeholder + fake score) → status = verified.
- Probation banner (30 days, ₦100k cap) surfaced across app.

## Stage 2 — Listings & Auctions
- Seller flow: create listing → upload inventory video + serial photo (mocked storage) → reserve price → state machine (draft → active → sold/withdrawn).
- Browse/search/filter, category pages, listing detail with countdown, bid history.
- Bidding: bid-lock hold (mocked), current price, winning bidder, auto-close, penalty on forfeit.

## Stage 3 — Escrow & Checkout
- Post-win checkout: shows Buyer Protection Fee breakdown, mock virtual account number + "I've paid" simulator.
- EscrowTransaction state machine: awaiting_payment → funded → inspection_window → released/disputed/refunded.
- 24-hour inspection countdown, "release now" and "open dispute" actions, auto-release job (simulated client-side + Cloud scheduled function stub).

## Stage 4 — Hub Delivery & OTP
- Hub directory (seeded Nigerian cities), seller drop-off flow, courier batch mock, buyer pickup with 6-digit OTP (hashed).
- Shipment state machine + timeline UI on order page.

## Stage 5 — Disputes & Admin/Ops Dashboard
- Buyer/seller dispute form referencing the inventory video/serial photo.
- Admin dashboard (role-gated): verifications queue, active auctions, escrow pipeline, hubs, disputes, account freezes, audit log viewer.

## Technical notes
- Stack: TanStack Start + Tailwind v4 + shadcn + TanStack Query + Lovable Cloud (Supabase under the hood).
- All money, ID, OTP, bank, and courier calls go through a `src/lib/mocks/*` layer with clearly typed interfaces so real providers can drop in later.
- Every state transition writes a row to a generic `state_transitions` table (actor, entity, from, to, reason, at) — matches your audit-trail requirement.
- Idempotency keys on all mock webhook/OTP/escrow endpoints, per your architecture doc.
- Roles stored in `user_roles` with `has_role()` security-definer function (never on profiles).

## What I'll build this turn if you approve
Stage 0 only: design system + landing page + shell + SEO. Then we go stage-by-stage so you can steer at each step.

Want me to proceed with Stage 0, or adjust scope/ordering first?