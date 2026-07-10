// Domain types — mirror the eventual Python backend response shapes.
// When the real API lands, only src/lib/api/client.ts changes; components stay put.

export type UserRole = "buyer" | "seller" | "admin";
export type VerificationTier = 1 | 2;
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface Session {
  userId: string;
  displayName: string;
  role: UserRole;
  tier: VerificationTier;
  verificationStatus: VerificationStatus;
  probationUntil?: string; // ISO date; if in future, user is on probation
}

export type ListingStatus = "draft" | "active" | "sold" | "withdrawn";

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerVerified: boolean;
  title: string;
  category: string;
  reservePrice: number; // NGN
  currentBid: number;
  bidCount: number;
  endsAt: string; // ISO
  status: ListingStatus;
  hubCity: string;
  coverColor: string; // placeholder hue while no image backend
}

export type EscrowStatus =
  | "awaiting_payment"
  | "funded"
  | "inspection_window"
  | "released"
  | "disputed"
  | "refunded";

export interface EscrowTransaction {
  id: string;
  listingId: string;
  amountNaira: number;
  buyerProtectionFee: number;
  status: EscrowStatus;
  fundedAt?: string;
  releaseDueAt?: string;
  virtualAccountRef: string;
}

export interface Hub {
  id: string;
  city: string;
  name: string;
  address: string;
}
