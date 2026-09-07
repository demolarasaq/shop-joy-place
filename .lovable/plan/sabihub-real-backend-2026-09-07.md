# Sabihub: real backend

Move the app off browser-only demo data onto the built-in backend, so listings, bids, orders and accounts are real, shared and permanent.

## What changes for people using the app

- **Real accounts.** Sign up with email + password or Google, instead of picking "Buyer / Seller / Admin". Everyone starts as a buyer; sellers are enabled from the dashboard; admin is granted by us.
- **Real listings.** Anything a seller publishes is stored and visible to every visitor, with photos and the inventory video kept in file storage.
- **Real bidding.** Bids are checked on the server (minimum ₦5,000 increase, auction still open, not your own listing, no bidding while unverified) and everyone sees the same current price.
- **Real escrow orders.** Winning an auction creates an order with a payment account, a 24-hour inspection countdown, and release/dispute actions recorded permanently.
- **Hubs and admin.** Hub list comes from the database; the admin console reads and acts on real verification requests, orders and users.
- The six demo listings are re-created as real seeded rows so the site is not empty.

## Payments and identity

Still simulated for now: the payment account numbers are generated, and "I've paid" stays as a test action available only to the account that owns the order. Identity verification records a request that an admin approves or rejects. Both are wired so a real provider can be plugged in later without touching the pages.

## Technical outline

Database (one migration, with grants, row-level security and policies on every table):

- `profiles` — display name, tier, verification status, probation date; created by trigger on signup
- `user_roles` + `app_role` enum + `has_role()` security-definer function (roles never on the profile)
- `hubs` — seeded with the six current hubs; public read
- `listings` — seller, title, category, reserve, current bid, bid count, ends at, status, hub, media arrays; public read of `active`/`sold`, owner read of own drafts, owner write
- `bids` — listing, bidder, amount, placed at; insert via server function only
- `orders` — full escrow shape incl. virtual account fields, funded/release-due/released/disputed timestamps; buyer, seller or admin read
- `verification_requests` — tier, status, admin note
- `updated_at` triggers throughout
- Seed INSERTs for hubs and the six demo listings in the same migration

Server functions in `src/lib/*.functions.ts` (auth via `requireSupabaseAuth`; admin actions re-check `has_role`):

- `placeBid` — validates increment, deadline, ownership, verification; updates listing + inserts bid atomically via a Postgres function
- `createOrderFromListing` — idempotent per buyer+listing, computes 3% protection fee, mints account details
- `markOrderPaid` (test-only, owner-scoped), `releaseOrder`, `disputeOrder` — state-machine guarded, 409-equivalent errors on invalid transitions
- `createListing` / `publishListing` / `withdrawListing`
- `requestVerification`, and admin: `decideVerification`, `resolveOrder`, `freezeUser`
- Public reads (browse, listing detail, hubs) use a publishable-key server client so pages still render for signed-out visitors

Frontend:

- `src/lib/api/client.ts` keeps its exact method signatures; bodies call the server functions. Components stay unchanged apart from auth.
- `useSession` reads the real session (profile + role) instead of localStorage; `/auth` becomes email/password + Google, and the Google provider is configured the same turn.
- Order and dashboard pages move under the protected `_authenticated` layout; browse, listing detail and marketing pages stay public and SSR-rendered.
- Media upload from `/listings/new` goes to a `listing-media` storage bucket (images public, ~50MB video cap) instead of pasted URLs.
- Remove the role picker and the `sabihub.session.v1` / `sabihub.orders.v1` local stores.

Not in this pass: real bank escrow, real KYC provider, auction auto-close scheduling (added next, as a scheduled job that closes ended auctions and creates orders).
