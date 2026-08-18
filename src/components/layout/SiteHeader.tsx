import Link from "next/link";

const NAV_LINKS = [
  { href: "/map", label: "Map" },
  { href: "/community", label: "Community" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-ink/10 bg-cream-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">
            TAKENWALK
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
            Piwoyi, Abuja
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
