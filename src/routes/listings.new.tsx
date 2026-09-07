import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  Film,
  Loader2,
  MapPin,
  Plus,
  Tag,
  Wallet,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useAuthState } from "@/lib/api/use-session";
import { api } from "@/lib/api/client";
import { formatNaira } from "@/lib/format";
import type { CreateListingInput } from "@/lib/api/types";

const categories = ["Phones", "Laptops", "Gaming", "Cameras", "Watches", "Drones", "Audio", "Other"];
const hubCities = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu", "Benin"];

const sampleImages: Record<string, string> = {
  Phones: "photo-1592286927505-1def25115558",
  Laptops: "photo-1517336714731-489689fd1ca8",
  Gaming: "photo-1606813907291-d86efa9b94db",
  Cameras: "photo-1519183071298-a2962be96f83",
  Watches: "photo-1587836374828-4dbafa94cf0e",
  Drones: "photo-1508614589041-895b88991e3e",
  Audio: "photo-1545454675-3531b543be5d",
  Other: "photo-1550009158-9ebf69173e03",
};

const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export const Route = createFileRoute("/listings/new")({
  head: () => ({
    meta: [
      { title: "Create a listing — Sabihub" },
      {
        name: "description",
        content: "List an item for auction on Sabihub. Upload inventory video and serial photo.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  const { session, loading: sessionLoading } = useAuthState();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateListingInput>({
    title: "",
    category: "Phones",
    reservePrice: 0,
    hubCity: "Lagos",
    coverColor: "280 60% 55%",
    images: [],
    videoUrl: "",
    publish: true,
  });

  const canList =
    sessionLoading || session?.role === "seller" || session?.role === "admin";

  const addSampleMedia = () => {
    const seed = Math.floor(Math.random() * 1000);
    const cover = `https://images.unsplash.com/${sampleImages[form.category]}?auto=format&fit=crop&w=1200&q=70&sig=${seed}`;
    setForm((f) => ({
      ...f,
      images: [cover, cover + "&w=800", cover + "&w=600"],
      videoUrl: SAMPLE_VIDEO,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) return setError("Please enter a listing title.");
    if (form.reservePrice <= 0) return setError("Reserve price must be greater than zero.");
    if (form.images.length === 0) return setError("Add at least one image.");

    setSaving(true);
    try {
      const listing = await api.listings.create(form);
      toast.success(form.publish ? "Listing published" : "Draft saved", {
        description: listing.title,
      });
      navigate({ to: "/listings/$id", params: { id: listing.id } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create listing.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
              Seller tools
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              Create a listing
            </h1>
          </div>
          {!canList && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning">
              Sign in as a seller to publish listings.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="surface-glass rounded-2xl p-6">
              <div className="flex items-center gap-2 font-display font-semibold">
                <Tag className="h-4 w-4 text-primary-glow" /> Item details
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. iPhone 15 Pro — 256GB Titanium Blue"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Reserve price (₦)</label>
                    <div className="relative">
                      <Wallet className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="number"
                        min={1000}
                        step={1000}
                        value={form.reservePrice || ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, reservePrice: Number(e.target.value) }))
                        }
                        placeholder="0"
                        className="w-full rounded-xl border border-input bg-background py-2.5 pr-4 pl-10 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Pickup hub city</label>
                  <div className="relative">
                    <MapPin className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select
                      value={form.hubCity}
                      onChange={(e) => setForm((f) => ({ ...f, hubCity: e.target.value }))}
                      className="w-full appearance-none rounded-xl border border-input bg-background py-2.5 pr-4 pl-10 text-sm outline-none focus:border-primary"
                    >
                      {hubCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-display font-semibold">
                  <Camera className="h-4 w-4 text-primary-glow" /> Photos & video
                </div>
                <button
                  type="button"
                  onClick={addSampleMedia}
                  className="text-xs font-medium text-primary-glow hover:text-primary"
                >
                  Use sample media
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                    <img src={img} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSampleMedia}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-surface text-xs text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-5 w-5" /> Add photo
                </button>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium">Inventory video URL</label>
                <div className="relative">
                  <Film className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="url"
                    value={form.videoUrl || ""}
                    onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-input bg-background py-2.5 pr-4 pl-10 text-sm outline-none focus:border-primary"
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  A short walkthrough showing the item condition and serial/IMEI. (Demo: paste any
                  video URL or use sample media.)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface-glass rounded-2xl p-6">
              <div className="font-display font-semibold">Preview</div>
              <div className="mt-4 overflow-hidden rounded-xl border border-border">
                {form.images[0] ? (
                  <img src={form.images[0]} alt="Cover preview" className="aspect-video w-full object-cover" />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-surface text-sm text-muted-foreground">
                    No cover image
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title</span>
                  <span className="line-clamp-1 max-w-[180px] text-right">{form.title || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{form.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reserve</span>
                  <span className="font-medium">{formatNaira(form.reservePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hub</span>
                  <span>{form.hubCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary-glow">
                    {form.publish ? "Active on create" : "Draft"}
                  </span>
                </div>
              </div>
            </div>

            <div className="surface-glass rounded-2xl p-6">
              <div className="font-display font-semibold">Publish options</div>
              <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-border bg-surface p-4">
                <span className="text-sm font-medium">Publish immediately</span>
                <input
                  type="checkbox"
                  checked={form.publish}
                  onChange={(e) => setForm((f) => ({ ...f, publish: e.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
              </label>
              <p className="mt-2 text-xs text-muted-foreground">
                Drafts are saved locally in this demo. Active listings appear in browse immediately.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !canList}
              className="bg-gradient-primary flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {form.publish ? "Publish listing" : "Save as draft"}
            </button>
          </div>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}
