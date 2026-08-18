"use client";

import { useCallback, useEffect, useState } from "react";
import { getAllPendingBusinesses, subscribeToSyncChanges } from "./db";
import { syncAllPending } from "./queue";
import { useOnlineStatus } from "./useOnlineStatus";

async function countPending() {
  const all = await getAllPendingBusinesses();
  return {
    pendingCount: all.filter((r) => r.syncStatus === "pending" || r.syncStatus === "syncing").length,
    errorCount: all.filter((r) => r.syncStatus === "error").length,
  };
}

export function useSyncQueue() {
  const [pendingCount, setPendingCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const online = useOnlineStatus();

  useEffect(() => {
    let ignore = false;

    async function refresh() {
      const counts = await countPending();
      if (ignore) return;
      setPendingCount(counts.pendingCount);
      setErrorCount(counts.errorCount);
    }

    refresh();
    const unsubscribe = subscribeToSyncChanges(refresh);
    return () => {
      ignore = true;
      unsubscribe();
    };
  }, []);

  const syncNow = useCallback(async () => {
    setSyncing(true);
    await syncAllPending();
    const counts = await countPending();
    setPendingCount(counts.pendingCount);
    setErrorCount(counts.errorCount);
    setSyncing(false);
  }, []);

  // Auto-resync on reconnect — deliberately inlined (not calling syncNow) so this
  // effect's async work stays directly visible to the purity/effect linter.
  useEffect(() => {
    if (!online) return;
    let ignore = false;
    syncAllPending()
      .then(countPending)
      .then((counts) => {
        if (ignore) return;
        setPendingCount(counts.pendingCount);
        setErrorCount(counts.errorCount);
      });
    return () => {
      ignore = true;
    };
  }, [online]);

  return { pendingCount, errorCount, syncing, online, syncNow };
}
