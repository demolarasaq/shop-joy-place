import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getPublicClient } from "./supabase-public.server";
import type { Hub, Listing, Order, Session, UserRole } from "./api/types";

/* ---------------------------------- mappers --------------------------------- */

type Row = Record<string, unknown>;

function toListing(r: Row): Listing {
  return {
    id: String(r["id"]),
    sellerId: (r["seller_id"] as string | null) ?? "",
    sellerName: String(r["seller_name"]),
    sellerVerified: Boolean(r["seller_verified"]),
    title: String(r["title"]),
    category: String(r["category"]),
    reservePrice: Number(r["reserve_price"]),
    currentBid: Number(r["current_bid"]),
    bidCount: Number(r["bid_count"]),
    endsAt: String(r["ends_at"]),
    status: r["status"] as Listing["status"],
    hubCity: String(r["hub_city"]),
    coverColor: String(r["cover_color"]),
    images: (r["images"] as string[] | null) ?? [],
    videoUrl: (r["video_url"] as string | null) ?? undefined,
  };
}

function toOrder(r: Row): Order {
  return {
    id: String(r["id"]),
    listingId: String(r["listing_id"]),
    listingTitle: String(r["listing_title"]),
    buyerId: String(r["buyer_id"]),
    sellerId: (r["seller_id"] as string | null) ?? "",
    sellerName: String(r["seller_name"]),
    hubCity: String(r["hub_city"]),
    winningBid: Number(r["winning_bid"]),
    buyerProtectionFee: Number(r["buyer_protection_fee"]),
    totalDue: Number(r["total_due"]),
    status: r["status"] as Order["status"],
    virtualAccountBank: String(r["virtual_account_bank"]),
    virtualAccountNumber: String(r["virtual_account_number"]),
    virtualAccountName: String(r["virtual_account_name"]),
    createdAt: String(r["created_at"]),
    fundedAt: (r["funded_at"] as string | null) ?? undefined,
    releaseDueAt: (r["release_due_at"] as string | null) ?? undefined,
    releasedAt: (r["released_at"] as string | null) ?? undefined,
    disputedAt: (r["disputed_at"] as string | null) ?? undefined,
    disputeReason: (r["dispute_reason"] as string | null) ?? undefined,
  };
}

/* ------------------------------- public reads ------------------------------- */

export const fetchListings = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .in("status", ["active", "sold"])
    .order("ends_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => toListing(r as Row));
});

export const fetchListing = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const supabase = getPublicClient();
    const { data: row, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? toListing(row as Row) : null;
  });

export const fetchHubs = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getPublicClient();
  const { data, error } = await supabase.from("hubs").select("*").order("city");
  if (error) throw new Error(error.message);
  return (data ?? []).map(
    (r): Hub => ({
      id: String((r as Row)["id"]),
      city: String((r as Row)["city"]),
      name: String((r as Row)["name"]),
      address: String((r as Row)["address"]),
    }),
  );
});

/* ------------------------------ session / profile ---------------------------- */

export const fetchSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Session> => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = (roleRows ?? []).map((r) => String((r as Row)["role"]));
    const role: UserRole = roles.includes("admin")
      ? "admin"
      : roles.includes("seller")
        ? "seller"
        : "buyer";
    const p = (profile ?? {}) as Row;
    return {
      userId,
      displayName: (p["display_name"] as string) ?? "Sabihub user",
      role,
      tier: (Number(p["tier"] ?? 1) === 2 ? 2 : 1) as Session["tier"],
      verificationStatus:
        (p["verification_status"] as Session["verificationStatus"]) ?? "unverified",
      probationUntil: (p["probation_until"] as string | null) ?? undefined,
    };
  });

export const becomeSeller = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role: "seller" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const requestVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ tier: z.union([z.literal(1), z.literal(2)]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("verification_requests")
      .insert({ user_id: context.userId, tier: data.tier });
    if (error) throw new Error(error.message);
    await context.supabase
      .from("profiles")
      .update({ verification_status: "pending" })
      .eq("id", context.userId);
    return { ok: true };
  });

/* --------------------------------- listings --------------------------------- */

const createListingSchema = z.object({
  title: z.string().min(3).max(140),
  category: z.string().min(1).max(60),
  reservePrice: z.number().int().min(1000),
  hubCity: z.string().min(1).max(60),
  coverColor: z.string().max(40),
  images: z.array(z.string().url()).max(10),
  videoUrl: z.string().url().optional(),
  publish: z.boolean(),
});

export const createListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => createListingSchema.parse(d))
  .handler(async ({ data, context }): Promise<Listing> => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, verification_status")
      .eq("id", userId)
      .maybeSingle();
    const p = (profile ?? {}) as Row;

    const { data: row, error } = await supabase
      .from("listings")
      .insert({
        seller_id: userId,
        seller_name: (p["display_name"] as string) ?? "Sabihub seller",
        seller_verified: p["verification_status"] === "verified",
        title: data.title,
        category: data.category,
        reserve_price: data.reservePrice,
        current_bid: data.reservePrice,
        bid_count: 0,
        ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: data.publish ? "active" : "draft",
        hub_city: data.hubCity,
        cover_color: data.coverColor,
        images: data.images,
        video_url: data.videoUrl ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return toListing(row as Row);
  });

export const fetchMyListings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("listings")
      .select("*")
      .eq("seller_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => toListing(r as Row));
  });

/* ----------------------------------- bids ----------------------------------- */

export const placeBid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ listingId: z.string(), amount: z.number().int().min(1000) }).parse(d),
  )
  .handler(async ({ data, context }): Promise<Listing> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.rpc("place_bid", {
      _listing_id: data.listingId,
      _bidder: context.userId,
      _amount: data.amount,
    });
    if (error) throw new Error(translateBidError(error.message));
    return toListing(row as unknown as Row);
  });

function translateBidError(message: string): string {
  if (message.includes("bid_too_low")) return "Your bid must beat the current bid by ₦5,000.";
  if (message.includes("auction_ended")) return "This auction has already closed.";
  if (message.includes("auction_not_active")) return "This auction is not open for bids.";
  if (message.includes("seller_cannot_bid")) return "You can't bid on your own listing.";
  if (message.includes("listing_not_found")) return "Listing not found.";
  return "Could not place that bid. Please try again.";
}

export const fetchBids = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ listingId: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const supabase = getPublicClient();
    const { data: rows, error } = await supabase
      .from("bids")
      .select("id, amount, placed_at")
      .eq("listing_id", data.listingId)
      .order("placed_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r, i) => ({
      id: String((r as Row)["id"]),
      alias: `Bidder #${i + 1}`,
      amount: Number((r as Row)["amount"]),
      placedAt: String((r as Row)["placed_at"]),
    }));
  });

/* ---------------------------------- orders ---------------------------------- */

export const fetchOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => toOrder(r as Row));
  });

export const fetchOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? toOrder(row as Row) : null;
  });

export const createOrderFromListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ listingId: z.string() }).parse(d))
  .handler(async ({ data, context }): Promise<Order> => {
    const { supabase, userId } = context;

    const { data: existing } = await supabase
      .from("orders")
      .select("*")
      .eq("listing_id", data.listingId)
      .eq("buyer_id", userId)
      .maybeSingle();
    if (existing) return toOrder(existing as Row);

    const pub = getPublicClient();
    const { data: listing } = await pub
      .from("listings")
      .select("*")
      .eq("id", data.listingId)
      .maybeSingle();
    if (!listing) throw new Error("Listing not found");
    const l = listing as Row;

    const winningBid = Number(l["current_bid"]);
    const fee = Math.round(winningBid * 0.03);
    const accountNumber =
      "9" + Math.floor(100000000 + Math.random() * 899999999).toString();

    const { data: row, error } = await supabase
      .from("orders")
      .insert({
        listing_id: String(l["id"]),
        listing_title: String(l["title"]),
        buyer_id: userId,
        seller_id: (l["seller_id"] as string | null) ?? null,
        seller_name: String(l["seller_name"]),
        hub_city: String(l["hub_city"]),
        winning_bid: winningBid,
        buyer_protection_fee: fee,
        total_due: winningBid + fee,
        status: "awaiting_payment",
        virtual_account_bank: "Providus Bank",
        virtual_account_number: accountNumber,
        virtual_account_name: "SABIHUB / " + String(l["id"]).slice(0, 8).toUpperCase(),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return toOrder(row as Row);
  });

async function transitionOrder(
  supabase: { from: (t: string) => any },
  userId: string,
  id: string,
  from: string[],
  patch: Record<string, unknown>,
): Promise<Order> {
  const { data: current } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!current) throw new Error("Order not found");
  const c = current as Row;
  if (c["buyer_id"] !== userId) throw new Error("Only the buyer can do that");
  if (!from.includes(String(c["status"]))) throw new Error("That action isn't available now");

  const { data: row, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return toOrder(row as Row);
}

// Test-only funding shortcut until the payment provider webhook is live.
export const markOrderPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const now = new Date();
    return transitionOrder(context.supabase as never, context.userId, data.id, ["awaiting_payment"], {
      status: "inspection_window",
      funded_at: now.toISOString(),
      release_due_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    });
  });

export const releaseOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) =>
    transitionOrder(context.supabase as never, context.userId, data.id, ["inspection_window"], {
      status: "released",
      released_at: new Date().toISOString(),
    }),
  );

export const disputeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string(), reason: z.string().min(3).max(1000) }).parse(d))
  .handler(async ({ data, context }) =>
    transitionOrder(context.supabase as never, context.userId, data.id, ["inspection_window"], {
      status: "disputed",
      disputed_at: new Date().toISOString(),
      dispute_reason: data.reason,
    }),
  );

/* ----------------------------------- admin ---------------------------------- */

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Forbidden");
}

export const adminListVerifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { data, error } = await context.supabase
      .from("verification_requests")
      .select("id, user_id, tier, status, admin_note, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: String((r as Row)["id"]),
      userId: String((r as Row)["user_id"]),
      tier: Number((r as Row)["tier"]),
      status: String((r as Row)["status"]),
      note: ((r as Row)["admin_note"] as string | null) ?? undefined,
      createdAt: String((r as Row)["created_at"]),
    }));
  });

export const adminDecideVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string(),
        decision: z.union([z.literal("approve"), z.literal("reject")]),
        note: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const status = data.decision === "approve" ? "verified" : "rejected";
    const { data: row, error } = await context.supabase
      .from("verification_requests")
      .update({ status, admin_note: data.note ?? null })
      .eq("id", data.id)
      .select("user_id, tier")
      .single();
    if (error) throw new Error(error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("profiles")
      .update({
        verification_status: status,
        tier: Number((row as Row)["tier"]) === 2 ? 2 : 1,
      })
      .eq("id", String((row as Row)["user_id"]));
    return { ok: true };
  });

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => toOrder(r as Row));
  });
