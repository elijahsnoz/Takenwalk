"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS, isAdminNavItemActive } from "@/lib/adminNav";
import { LogoMark } from "@/components/ui/Logo";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-ink/10 bg-cream-soft p-4 sm:flex">
      <Link href="/" className="mb-6 flex items-center gap-2">
        <LogoMark width={24} height={24} />
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-extrabold text-ink">TAKEN A WALK</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-soft">Piwoyi, Abuja</span>
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = isAdminNavItemActive(pathname, item.href);
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
