"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="shrink-0 rounded-full border border-ink/20 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5"
    >
      Sign out
    </button>
  );
}
