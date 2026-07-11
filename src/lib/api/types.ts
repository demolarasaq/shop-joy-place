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

export interface Order {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  sellerId: string;
  sellerName: string;
  hubCity: string;
  winningBid: number;
  buyerProtectionFee: number;
  totalDue: number;
  status: EscrowStatus;
  virtualAccountBank: string;
  virtualAccountNumber: string;
  virtualAccountName: string;
  createdAt: string;
  fundedAt?: string;
  releaseDueAt?: string; // ISO — 24h after funded
  releasedAt?: string;
  disputedAt?: string;
  disputeReason?: string;
}

export interface Hub {
  id: string;
  city: string;
  name: string;
  address: string;
}
