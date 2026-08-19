# Sabihub API Contract (v1)

Target for the Python backend. The frontend currently implements this exact surface as mocks in
`src/lib/api/client.ts`. When the backend is live, only that file changes — components stay put.

- Base URL: `${VITE_API_BASE_URL}` (e.g. `https://api.sabihub.ng/v1`)
- Content type: `application/json; charset=utf-8`
- Auth: `Authorization: Bearer <access_token>`; server-side sessions are authoritative.
  Never trust client-supplied role/tier flags.
- Money: integer **kobo-free NGN** (whole naira, e.g. `742000` = ₦742,000).
- Timestamps: ISO-8601 UTC strings (`2026-08-19T12:50:00Z`).
- IDs: opaque strings. Current mock formats: `L-XXXXXX` (listing), `O-XXXXXX` (order).

## Error shape

All non-2xx responses:

```json
{ "error": { "code": "listing_not_found", "message": "Listing not found", "details": {} } }
```

| Status | When |
| --- | --- |
| 400 | validation failure (`details` maps field -> message) |
| 401 | missing/expired session |
| 403 | role or tier not permitted, user frozen, probation limit hit |
| 404 | resource not found |
| 409 | state-machine violation (e.g. release on an unfunded order) |
| 422 | business rule rejection (bid below minimum, reserve not met) |
| 429 | rate limited |

## Idempotency

`POST` endpoints that move money or create records accept `Idempotency-Key: <uuid>`.
Replaying the same key returns the original response. Required for: create order, mark paid,
release, dispute, place bid.

---

## 1. Auth & session

### `GET /auth/session`
Returns the current `Session` or `204 No Content`.

```ts
Session {
  userId: string
  displayName: string
  role: "buyer" | "seller" | "admin"
  tier: 1 | 2
  verificationStatus: "unverified" | "pending" | "verified" | "rejected"
  probationUntil?: string  // ISO; if in the future the user is on probation
}
```

### `POST /auth/otp/request`
`{ "channel": "email" | "phone", "identifier": "..." }` -> `202 { "expiresAt": "..." }`

### `POST /auth/otp/verify`
`{ "identifier": "...", "code": "123456" }` -> `200 { "session": Session, "accessToken": "...", "refreshToken": "...", "expiresAt": "..." }`

### `POST /auth/refresh`
`{ "refreshToken": "..." }` -> same payload as verify.

### `POST /auth/signout`
`204`. Invalidates the refresh token server-side.

> The demo build replaces these with a local role-picker (`api.auth.signInAs`). That path is
> removed at integration time.

---

## 2. Verification

### `POST /verification/start`
`{ "tier": 1 | 2 }` -> `{ "providerSessionUrl": "...", "verificationId": "..." }`
Identity documents (NIN/BVN, liveness) go **directly to the provider**; Sabihub stores only the
token, score, and status.

### `GET /verification/status`
`{ "verificationId": "...", "tier": 1|2, "status": "unverified"|"pending"|"verified"|"rejected", "livenessScore": 0.94, "probationUntil": "..." }`

### `POST /verification/webhook` (provider -> backend)
Signed callback that flips status and unlocks tier limits. Verify the signature before processing.

---

## 3. Listings

```ts
Listing {
  id: string
  sellerId: string
  sellerName: string
  sellerVerified: boolean
  title: string
  category: string
  reservePrice: number
  currentBid: number
  bidCount: number
  endsAt: string
  status: "draft" | "active" | "sold" | "withdrawn"
  hubCity: string
  coverColor: string   // "H S% L%" fallback hue
  images: string[]     // first entry is the cover
  videoUrl?: string    // inventory-check walkthrough
}
```

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/listings` | Query: `q`, `category`, `city`, `status`, `sort` (`ending_soon`\|`price_asc`\|`price_desc`\|`newest`), `cursor`, `limit`. Returns `{ "items": Listing[], "nextCursor": string \| null }` |
| GET | `/listings/{id}` | single `Listing`; 404 if missing |
| GET | `/listings?sellerId={id}` | seller's listings (owner or admin only for drafts) |
| POST | `/listings` | body = `CreateListingInput`; seller role + verified required |
| PATCH | `/listings/{id}` | title/reserve/media edits while `draft` only |
| POST | `/listings/{id}/publish` | `draft` -> `active`; requires >= 1 image and an inventory video |
| POST | `/listings/{id}/withdraw` | allowed only with zero bids |

```ts
CreateListingInput {
  title: string
  category: string
  reservePrice: number
  hubCity: string
  coverColor: string
  images: string[]     // media IDs/URLs returned by the upload endpoint
  videoUrl?: string
  publish: boolean
}
```

### Media upload
`POST /media/upload-url` -> `{ "uploadUrl": "...", "publicUrl": "...", "mediaId": "..." }`
Client PUTs the file straight to object storage (S3/R2/Supabase Storage), then submits
`publicUrl` values in `images` / `videoUrl`.

---

## 4. Bidding

### `POST /listings/{id}/bids`
`{ "amount": 747000 }` -> `{ "listing": Listing, "bid": Bid }`

```ts
Bid { id, listingId, bidderId, bidderAlias, amount, placedAt }
```

Server rules (do not enforce these only on the client):
- `amount >= currentBid + minIncrement` (frontend assumes **₦5,000**; expose `minIncrement` on the listing if it varies).
- Auction must be `active` and `endsAt` in the future.
- Bidder must be verified and not the seller.
- Bid-lock: a winning bid is binding; expose the buyer's outstanding-lock count so the UI can warn.
- Anti-snipe: extend `endsAt` by 2 minutes for bids inside the final 2 minutes.

### `GET /listings/{id}/bids`
`{ "items": Bid[] }`, newest first, aliased bidders (`"Bidder #4"`), never raw identities.

### `GET /me/bids`
Buyer's bids with `outcome: "leading" | "outbid" | "won" | "lost"`.

### Auction close (backend job)
On `endsAt`: if `currentBid >= reservePrice`, mark listing `sold`, create the escrow order for the
winner, and notify both parties. Otherwise mark it `withdrawn`/relist.

---

## 5. Escrow orders

```ts
Order {
  id: string
  listingId: string
  listingTitle: string
  buyerId: string
  sellerId: string
  sellerName: string
  hubCity: string
  winningBid: number
  buyerProtectionFee: number      // currently 3% of winningBid, server-computed
  totalDue: number
  status: "awaiting_payment" | "funded" | "inspection_window" | "released" | "disputed" | "refunded"
  virtualAccountBank: string
  virtualAccountNumber: string
  virtualAccountName: string
  createdAt: string
  fundedAt?: string
  releaseDueAt?: string           // fundedAt + 24h
  releasedAt?: string
  disputedAt?: string
  disputeReason?: string
}
```

State machine (server-enforced; reject invalid transitions with 409):

```text
awaiting_payment -> funded -> inspection_window -> released
                                      |-> disputed -> released | refunded
awaiting_payment -> refunded (expired / cancelled)
```

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/orders` | caller's orders, newest first |
| GET | `/orders/{id}` | buyer, seller, or admin only |
| POST | `/orders` | `{ "listingId": "..." }`; idempotent — returns the existing order for the same buyer+listing. Mints the virtual account. |
| POST | `/orders/{id}/release` | buyer or auto-release job; only from `inspection_window` |
| POST | `/orders/{id}/dispute` | `{ "reason": "..." }`; only from `inspection_window` |
| POST | `/orders/{id}/cancel` | buyer, only from `awaiting_payment` |

The demo `markPaid` call does **not** exist in production. Funding arrives via:

### `POST /webhooks/payments` (provider -> backend)
Signed. On a matching credit to the virtual account: `awaiting_payment -> funded`, set `fundedAt`.
`funded -> inspection_window` fires when the hub confirms buyer pickup, which sets
`releaseDueAt = now + 24h`. Auto-release at `releaseDueAt` unless disputed.

---

## 6. Shipment & hubs

```ts
Hub { id, city, name, address }

Shipment {
  orderId: string
  status: "awaiting_dropoff" | "in_transit" | "at_hub" | "picked_up"
  hub: Hub
  droppedOffAt?: string
  arrivedAt?: string
  pickedUpAt?: string
  courierRef?: string
}
```

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/hubs` | `{ "items": Hub[] }`, filterable by `city` |
| GET | `/orders/{id}/shipment` | timeline shown on the order page |
| POST | `/orders/{id}/shipment/dropoff` | hub staff scan; `awaiting_dropoff -> in_transit` |
| POST | `/orders/{id}/shipment/arrival` | `in_transit -> at_hub`, issues the pickup OTP |
| POST | `/orders/{id}/pickup/verify` | `{ "otp": "123456" }`; `at_hub -> picked_up`, starts the inspection window |

OTP: 6 digits, 30-minute TTL, max 5 attempts, delivered to the buyer only. Never return it in a
buyer-readable GET after pickup.

---

## 7. Admin

All require `role = "admin"`, server-verified. Every mutation writes an audit-log entry.

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/admin/verifications` | queue, filter by `status` |
| POST | `/admin/verifications/{id}/decision` | `{ "decision": "approve" \| "reject", "note": "..." }` |
| GET | `/admin/orders` | escrow pipeline, filter by `status` |
| POST | `/admin/orders/{id}/resolve` | `{ "outcome": "release" \| "refund", "note": "..." }` |
| GET | `/admin/users` | search, tier, freeze state |
| POST | `/admin/users/{id}/freeze` | `{ "frozen": true, "reason": "..." }` |
| GET | `/admin/hubs` / `POST /admin/hubs` | hub CRUD |
| GET | `/admin/audit-log` | cursor-paginated, immutable |

---

## 8. Integration checklist for the frontend swap

1. Add `VITE_API_BASE_URL` and a `fetchJson` helper with bearer-token injection + 401 refresh.
2. Replace each method body in `src/lib/api/client.ts` — the signatures already match this contract.
3. Delete `signInAs` and the role-picker route; point `/auth` at the OTP flow.
4. Drop the `sabihub.orders.v1` / `sabihub.session.v1` localStorage stores.
5. Remove the "Simulate winning -> Checkout" and "I've paid" demo shortcuts.
6. Replace mock media strings with real upload-URL round-trips.
7. Enable CORS for the app origins and set `Access-Control-Allow-Credentials` if cookies are used.
