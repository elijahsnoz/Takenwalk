"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/piwoyi", label: "Overview", icon: "🏠" },
  { href: "/admin/piwoyi/map", label: "Piwoyi Map", icon: "📍" },
  { href: "/admin/piwoyi/businesses", label: "Businesses", icon: "🏪" },
  { href: "/admin/piwoyi/jobs", label: "Jobs", icon: "🚶" },
  { href: "/admin/piwoyi/walkers", label: "Walkers", icon: "🚶‍♂️" },
  { href: "/admin/sales", label: "Sales", icon: "📈" },
  { href: "/community", label: "Community", icon: "👥" },
  { href: "/admin/messages", label: "Messages", icon: "💬" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  { href: "/admin/support", label: "Support", icon: "❓" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-ink/10 bg-cream-soft p-4 sm:flex">
      <Link href="/" className="mb-6 flex flex-col leading-none">
        <span className="font-display text-lg font-extrabold text-ink">TAKENWALK</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-soft">Piwoyi, Abuja</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/community" && pathname?.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                active ? "bg-ink text-cream-soft" : "text-ink hover:bg-ink/5"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
