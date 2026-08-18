"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function AdminTopbar({ adminName }: { adminName: string }) {
  return (
    <header className="flex items-center justify-between border-b border-ink/10 bg-paper px-6 py-4">
      <div>
        <p className="text-sm text-ink-soft">
          Welcome, <span className="font-semibold text-ink">{adminName}</span>
        </p>
        <div className="flex gap-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
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
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="rounded-full border border-ink/20 px-4 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
      >
        Sign out
      </button>
    </header>
  );
}
