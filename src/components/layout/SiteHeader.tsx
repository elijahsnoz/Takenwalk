import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoMark } from "@/components/ui/Logo";

const NAV_LINKS = [
  { href: "/map", label: "Map" },
  { href: "/community", label: "Community" },
];

export async function SiteHeader() {
  const session = await auth();
  const isCustomer = session?.user?.role === "CUSTOMER";

  return (
    <header className="border-b border-ink/10 bg-cream-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark width={26} height={26} />
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-extrabold tracking-tight text-ink">
              TAKEN A WALK
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
              Piwoyi, Abuja
            </span>
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
          <Link
            href={isCustomer ? "/account" : "/account/login"}
            className="text-sm font-medium text-ink-soft hover:text-ink"
          >
            {isCustomer ? "My Account" : "Sign In"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
