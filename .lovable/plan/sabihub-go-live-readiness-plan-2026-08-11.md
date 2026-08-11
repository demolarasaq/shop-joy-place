# Sabihub — Go-live Readiness Plan

Current build covers Stages 0–3 (foundation, browse/auction, escrow/checkout, photos/videos, dark/light theme). Before a real public launch, the remaining work splits into three lanes: **Frontend completion**, **Backend integration**, and **Legal/operations**.

## 1. Frontend completion (needed for a credible live MVP)

### Content & marketing pages still stubs
- `/how-it-works` — exists as a route but is empty; should explain the 6-step flow already shown on the landing page.
- `/trust` — empty route; should detail verification tiers, escrow mechanics, NDPA-safe data handling, and dispute process.
- `/sellers` — empty route; should explain 0% commission, verification requirements, listing process, and hub drop-off.
- Add a `/terms` or `/privacy` placeholder (required for trust and ad/compliance reviews).

### Seller-facing flows missing
- Create listing form: title, category, reserve price, hub city, inventory video upload, serial/IMEI photo upload.
- Seller dashboard: my listings (draft / active / sold), bids received, orders awaiting drop-off, payout status.
- Listing state machine UI: draft → active → sold/withdrawn.

### Buyer-facing gaps
- Real bid placement currently only sets local state; needs backend bid endpoint, bid-lock logic, and auto-close.
- My bids page (dashboard tile links to `/browse` as a stub).
- Order page shipment timeline: seller drop-off → courier batch → hub arrival → OTP pickup.

### Admin/Ops console
- Verifications queue, escrow pipeline, disputes list, hub management, user freezes, audit log viewer.

### UX polish
- Mobile bottom navigation (mentioned in original Stage 0 plan but not implemented).
- Loading skeletons for browse/listing pages.
- Empty states and error boundaries beyond the root 404/error pages.
- Form validation with clear error messages.
- Toast/sonner feedback for copy, bid, payment, dispute actions.

## 2. Backend integration (you mentioned Python APIs later)

The frontend already has a typed mock layer in `src/lib/api/client.ts`. To go live, swap it for real HTTP calls to your Python backend for:

- Authentication (email/OTP or passwordless) and session management.
- Listings CRUD, search/filter, bidding, auction close.
- Escrow: virtual account generation, payment webhook, 24-hour inspection window, release/dispute/refund.
- Verification: NIN/BVN token exchange, liveness score, tier/probation status.
- Hub network, shipment tracking, OTP generation/validation.
- Admin operations and audit-log retrieval.
- File storage for inventory videos and serial photos (e.g., S3/Supabase Storage / Cloudflare R2).

Important: the current mock stores orders in `localStorage` and uses a fake role-picker. A real launch needs server-side sessions, RLS/database auth, and never trust client-side role flags.

## 3. Legal / operations checklist (from your uploaded documents)

- CAC business registration and tax identification.
- NDPA compliance: privacy policy, consent flow, data-processing agreements with identity/payment partners.
- Escrow partner: signed agreement with a CBN-licensed bank or payment provider.
- Hub partner contracts with pickup shops/courier networks.
- Terms of service, seller agreement, buyer protection policy.
- Dispute resolution process and refund policy.
- KYC/AML policy for high-value sellers/bidders.

## Recommended next steps

1. Finish the three stub marketing pages (`/how-it-works`, `/trust`, `/sellers`) and add `/privacy` + `/terms`.
2. Build the seller listing creation flow and seller dashboard tiles.
3. Add the shipment timeline and OTP pickup UI to orders.
4. Build a lightweight admin console for verifications and disputes.
5. Swap the mock API client for your Python backend endpoints.
6. Run security scan, accessibility check, and mobile responsiveness pass before publishing.

## Decision for you

Do you want me to continue finishing the **frontend only** (steps 1–4) so the UI is complete and ready for your Python API, or do you want to pause here and start integrating the backend now?
