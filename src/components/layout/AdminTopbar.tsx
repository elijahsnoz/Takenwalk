"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Drawer } from "@/components/ui/Drawer";
import { ADMIN_NAV_ITEMS, isAdminNavItemActive } from "@/lib/adminNav";

export function AdminTopbar({ adminName }: { adminName: string }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="flex items-center justify-between gap-3 border-b border-ink/10 bg-paper px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            className="rounded-lg border border-ink/20 px-2.5 py-1.5 text-lg sm:hidden"
          >
            ☰
          </button>
          <div>
            <p className="text-sm text-ink-soft">
              Welcome, <span className="font-semibold text-ink">{adminName}</span>
            </p>
            <div className="hidden gap-4 text-xs font-semibold uppercase tracking-wide text-ink-soft sm:flex">
              <Link href="/community" className="hover:text-ink">
                Community
              </Link>
              <Link href="/admin/piwoyi/jobs" className="hover:text-ink">
                Jobs
              </Link>
              <Link href="/admin/sales" className="hover:text-ink">
                Sales
              </Link>
            </div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="shrink-0 rounded-full border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5 sm:px-4 sm:text-sm"
        >
          Sign out
        </button>
      </header>

      <Drawer open={navOpen} onClose={() => setNavOpen(false)} title="Menu">
        <nav className="flex flex-col gap-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = isAdminNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setNavOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  active ? "bg-ink text-cream-soft" : "text-ink hover:bg-ink/5"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </Drawer>
    </>
  );
}
