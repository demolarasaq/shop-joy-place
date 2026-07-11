// Mock API client. Same surface the real Python backend will expose.
// Swap the bodies of these functions for `fetch(...)` calls when the backend is live.

import type { Hub, Listing, Order, Session, UserRole } from "./types";

const SESSION_KEY = "sabihub.session.v1";
const ORDERS_KEY = "sabihub.orders.v1";

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(s: Session | null) {
  if (typeof window === "undefined") return;
  if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("sabihub:session"));
}

const roleProfiles: Record<UserRole, Omit<Session, "userId">> = {
  buyer: {
    displayName: "Adaeze O.",
    role: "buyer",
    tier: 1,
    verificationStatus: "verified",
  },
  seller: {
    displayName: "Tunde M.",
    role: "seller",
    tier: 2,
    verificationStatus: "verified",
    probationUntil: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  admin: {
    displayName: "Ops Console",
    role: "admin",
    tier: 2,
    verificationStatus: "verified",
  },
};

export const api = {
  auth: {
    getSession(): Session | null {
      return readSession();
    },
    signInAs(role: UserRole): Session {
      const profile = roleProfiles[role];
      const session: Session = { userId: `mock-${role}`, ...profile };
      writeSession(session);
      return session;
    },
    signOut() {
      writeSession(null);
    },
  },

  listings: {
    async list(): Promise<Listing[]> {
      return mockListings;
    },
    async get(id: string): Promise<Listing | undefined> {
      return mockListings.find((l) => l.id === id);
    },
  },

  hubs: {
    async list(): Promise<Hub[]> {
      return mockHubs;
    },
  },
};

const mockHubs: Hub[] = [
  { id: "h1", city: "Lagos", name: "Yaba Hub", address: "Herbert Macaulay Way" },
  { id: "h2", city: "Lagos", name: "Lekki Hub", address: "Admiralty Way, Phase 1" },
  { id: "h3", city: "Abuja", name: "Wuse Hub", address: "Aminu Kano Crescent" },
  { id: "h4", city: "Port Harcourt", name: "GRA Hub", address: "Aba Road" },
  { id: "h5", city: "Ibadan", name: "Bodija Hub", address: "Awolowo Avenue" },
  { id: "h6", city: "Kano", name: "Sabon Gari Hub", address: "Fagge District" },
];

const mockListings: Listing[] = [
  {
    id: "L-1001",
    sellerId: "s-1",
    sellerName: "Tunde M.",
    sellerVerified: true,
    title: "iPhone 15 Pro — 256GB Titanium Blue",
    category: "Phones",
    reservePrice: 700_000,
    currentBid: 742_000,
    bidCount: 14,
    endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000 + 14 * 60 * 1000).toISOString(),
    status: "active",
    hubCity: "Lagos",
    coverColor: "280 60% 55%",
  },
  {
    id: "L-1002",
    sellerId: "s-2",
    sellerName: "Ngozi A.",
    sellerVerified: true,
    title: "Sony PlayStation 5 Slim + 2 controllers",
    category: "Gaming",
    reservePrice: 380_000,
    currentBid: 415_000,
    bidCount: 22,
    endsAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: "active",
    hubCity: "Abuja",
    coverColor: "220 65% 55%",
  },
  {
    id: "L-1003",
    sellerId: "s-3",
    sellerName: "Kelechi B.",
    sellerVerified: true,
    title: "MacBook Air M2 — 512GB Midnight",
    category: "Laptops",
    reservePrice: 900_000,
    currentBid: 960_000,
    bidCount: 9,
    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    hubCity: "Port Harcourt",
    coverColor: "155 40% 45%",
  },
  {
    id: "L-1004",
    sellerId: "s-4",
    sellerName: "Amina S.",
    sellerVerified: true,
    title: "Canon EOS R6 Mark II + 24-105mm lens",
    category: "Cameras",
    reservePrice: 1_600_000,
    currentBid: 1_720_000,
    bidCount: 6,
    endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: "active",
    hubCity: "Lagos",
    coverColor: "310 55% 50%",
  },
  {
    id: "L-1005",
    sellerId: "s-5",
    sellerName: "Ifeanyi P.",
    sellerVerified: true,
    title: "Rolex Oyster Perpetual 41 — 2022",
    category: "Watches",
    reservePrice: 5_800_000,
    currentBid: 6_100_000,
    bidCount: 4,
    endsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    status: "active",
    hubCity: "Abuja",
    coverColor: "45 70% 55%",
  },
  {
    id: "L-1006",
    sellerId: "s-6",
    sellerName: "Chidi K.",
    sellerVerified: true,
    title: "DJI Mavic 3 Pro Fly More Combo",
    category: "Drones",
    reservePrice: 2_100_000,
    currentBid: 2_240_000,
    bidCount: 11,
    endsAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    status: "active",
    hubCity: "Ibadan",
    coverColor: "200 55% 50%",
  },
];
