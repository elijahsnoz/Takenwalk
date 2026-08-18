"use client";

import { useSyncQueue } from "@/lib/offline/useSyncQueue";

export function SyncStatusIndicator() {
  const { pendingCount, errorCount, syncing, online, syncNow } = useSyncQueue();
  const unsynced = pendingCount + errorCount;

  if (unsynced === 0) {
    return (
      <span className="text-xs font-medium text-green">
        ✓ All synced{online ? "" : " (offline)"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-orange-soft px-3 py-1.5 text-xs font-semibold text-orange">
      <span>
        {!online ? "Offline — " : ""}
        {unsynced} unsynced
      </span>
      <button onClick={() => syncNow()} disabled={syncing || !online} className="underline disabled:opacity-50">
        {syncing ? "Syncing…" : "Sync Now"}
      </button>
    </div>
  );
}
