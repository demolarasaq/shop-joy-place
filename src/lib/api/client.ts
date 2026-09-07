// Real backend client. Components keep calling `api.*`; the bodies now hit the
// database through TanStack server functions (see src/lib/sabihub.functions.ts).

import { supabase } from "@/integrations/supabase/client";
import { setAccessToken } from "@/lib/auth-token";
import {
  adminDecideVerification,
  adminListVerifications,
  becomeSeller,
  createListing,
  createOrderFromListing,
  disputeOrder,
  fetchBids,
  fetchHubs,
  fetchListing,
  fetchListings,
  fetchMyListings,
  fetchOrder,
  fetchOrders,
  fetchSession,
  markOrderPaid,
  placeBid,
  releaseOrder,
  requestVerification,
} from "@/lib/sabihub.functions";
import type { CreateListingInput, Hub, Listing, Order, Session } from "./types";

/* --------------------------- session cache (client) -------------------------- */

let cachedSession: Session | null = null;
let sessionPromise: Promise<Session | null> | null = null;

function emitSessionChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("sabihub:session"));
}

async function loadSession(): Promise<Session | null> {
  if (typeof window === "undefined") return null;
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    cachedSession = null;
    return null;
  }
  setAccessToken(data.session.access_token);
  // The very first call can land while the auth lock is still held, so the
  // request goes out unauthenticated. Retry briefly before giving up.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      cachedSession = await fetchSession();
      return cachedSession;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  cachedSession = null;
  return cachedSession;
}


function refreshSession(): Promise<Session | null> {
  sessionPromise = loadSession().then((s) => {
    emitSessionChange();
    return s;
  });
  return sessionPromise;
}

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event, session) => {
    setAccessToken(session?.access_token ?? null);
    if (event === "TOKEN_REFRESHED") return;
    // Never call supabase.auth.* synchronously inside this callback — it deadlocks
    // the auth lock and server calls then go out without a bearer token.
    setTimeout(() => {
      refreshSession();
    }, 0);
  });
}

/* ---------------------------------- the api ---------------------------------- */

export const api = {
  auth: {
    /** Cached snapshot — null until `ready()` resolves. */
    getSession(): Session | null {
      return cachedSession;
    },
    /** Resolves once the real session has been loaded from the backend. */
    ready(): Promise<Session | null> {
      if (!sessionPromise) refreshSession();
      return sessionPromise!;
    },
    async signUp(email: string, password: string, displayName: string) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { display_name: displayName },
        },
      });
      if (error) throw new Error(error.message);
      await refreshSession();
      return { needsEmailConfirmation: !data.session };
    },
    async signIn(email: string, password: string) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      await refreshSession();
    },
    async signOut() {
      await supabase.auth.signOut();
      cachedSession = null;
      sessionPromise = Promise.resolve(null);
      emitSessionChange();
    },
    async becomeSeller() {
      await becomeSeller();
      await refreshSession();
    },
    async requestVerification(tier: 1 | 2) {
      await requestVerification({ data: { tier } });
      await refreshSession();
    },
  },

  listings: {
    async list(): Promise<Listing[]> {
      return fetchListings();
    },
    async get(id: string): Promise<Listing | undefined> {
      return (await fetchListing({ data: { id } })) ?? undefined;
    },
    async create(input: CreateListingInput): Promise<Listing> {
      const listing = await createListing({ data: input });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sabihub:listings"));
      }
      return listing;
    },
    async bySeller(_sellerId: string): Promise<Listing[]> {
      return fetchMyListings();
    },
    async bids(listingId: string) {
      return fetchBids({ data: { listingId } });
    },
    async placeBid(listingId: string, amount: number): Promise<Listing> {
      return placeBid({ data: { listingId, amount } });
    },
  },

  hubs: {
    async list(): Promise<Hub[]> {
      return fetchHubs();
    },
  },

  orders: {
    async list(): Promise<Order[]> {
      return fetchOrders();
    },
    async get(id: string): Promise<Order | undefined> {
      return (await fetchOrder({ data: { id } })) ?? undefined;
    },
    async getByListing(listingId: string, _buyerId: string): Promise<Order | undefined> {
      const all = await fetchOrders();
      return all.find((o) => o.listingId === listingId);
    },
    async createFromListing(listingId: string, _buyerId: string): Promise<Order> {
      const order = await createOrderFromListing({ data: { listingId } });
      emitOrders();
      return order;
    },
    async markPaid(id: string): Promise<Order> {
      const order = await markOrderPaid({ data: { id } });
      emitOrders();
      return order;
    },
    async release(id: string): Promise<Order> {
      const order = await releaseOrder({ data: { id } });
      emitOrders();
      return order;
    },
    async dispute(id: string, reason: string): Promise<Order> {
      const order = await disputeOrder({ data: { id, reason } });
      emitOrders();
      return order;
    },
  },

  admin: {
    async verifications() {
      return adminListVerifications();
    },
    async decideVerification(id: string, decision: "approve" | "reject", note?: string) {
      return adminDecideVerification({ data: { id, decision, note } });
    },
  },
};

function emitOrders() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("sabihub:orders"));
}
