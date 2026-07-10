import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/hubs")({
  head: () => ({
    meta: [
      { title: "Delivery hubs — Sabihub" },
      {
        name: "description",
        content:
          "Sabihub's partner hub network across Lagos, Abuja, Port Harcourt, Ibadan, Kano and more. Drop-off and OTP pickup.",
      },
      { property: "og:title", content: "Sabihub delivery hubs" },
      {
        property: "og:description",
        content: "Partner hubs across Nigeria for drop-off and OTP pickup.",
      },
    ],
  }),
  component: Page,
});

const hubs = [
  { city: "Lagos", name: "Yaba Hub", address: "Herbert Macaulay Way" },
  { city: "Lagos", name: "Lekki Hub", address: "Admiralty Way, Phase 1" },
  { city: "Abuja", name: "Wuse Hub", address: "Aminu Kano Crescent" },
  { city: "Port Harcourt", name: "GRA Hub", address: "Aba Road" },
  { city: "Ibadan", name: "Bodija Hub", address: "Awolowo Avenue" },
  { city: "Kano", name: "Sabon Gari Hub", address: "Fagge District" },
  { city: "Enugu", name: "Independence Hub", address: "Independence Layout" },
  { city: "Benin", name: "Ring Road Hub", address: "King's Square" },
];

function Page() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="text-xs font-medium tracking-[0.2em] text-primary-glow uppercase">
          Hub network
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
          Partner hubs near your buyers.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Sellers drop off at their local hub. Items move through our courier batch to the buyer's
          chosen hub, where pickup is confirmed with a one-time code.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {hubs.map((h) => (
            <div key={h.name} className="surface-glass rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary-glow" />
                {h.city}
              </div>
              <div className="mt-1 font-display font-semibold">{h.name}</div>
              <div className="text-sm text-muted-foreground">{h.address}</div>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
