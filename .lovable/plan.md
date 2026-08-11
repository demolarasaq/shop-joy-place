# Sabihub Go-live Readiness Plan

## Frontend — COMPLETE
- [x] Marketing stubs fleshed out (`/how-it-works`, `/trust`, `/sellers`)
- [x] Legal pages created (`/privacy`, `/terms`)
- [x] Seller listing creation flow (`/listings/new`)
- [x] Shipment timeline on order detail
- [x] Admin console (`/admin`)
- [x] Mobile bottom navigation
- [x] Toast feedback on key actions (bid, copy, pay, release, dispute, listing create)
- [x] Type-check and production build verified

## Remaining before production launch
1. **Backend integration** — swap `src/lib/api/client.ts` mocks for calls to your Python API.
2. **Real authentication** — replace the role-picker demo with email/phone OTP or OAuth.
3. **Real payments & escrow** — integrate a payment provider and bank-held escrow partner.
4. **Real media storage** — upload inventory videos/photos to cloud object storage.
5. **End-to-end QA** — test bid → win → checkout → inspection → release on staging.
6. **Legal & compliance** — CAC registration, NDPA audit, terms/privacy review by a lawyer.

The frontend is ready to hand off or wire to your Python backend whenever you have the API contract.
