import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="font-display text-lg font-semibold gradient-text">Sabihub</div>
          <p className="mt-3 text-sm text-muted-foreground">
            A trust-first auction marketplace for Nigeria. Verified sellers, bank-held escrow,
            hub-based delivery.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            { to: "/how-it-works", label: "How it works" },
            { to: "/trust", label: "Trust & safety" },
            { to: "/hubs", label: "Delivery hubs" },
          ]}
        />
        <FooterCol
          title="Sellers"
          links={[
            { to: "/sellers", label: "Start selling" },
            { to: "/sellers", label: "0% commission" },
            { to: "/sellers", label: "Payouts" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { to: "/", label: "About" },
            { to: "/", label: "Privacy (NDPA)" },
            { to: "/", label: "Terms" },
          ]}
        />
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Sabihub Technologies Ltd. Lagos, Nigeria.</span>
          <span>Escrow held by a licensed CBN partner bank. Identity verification via NIMC/NIBSS.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <div className="text-sm font-medium text-foreground">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map((l, i) => (
          <li key={i}>
            <Link to={l.to} className="hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
