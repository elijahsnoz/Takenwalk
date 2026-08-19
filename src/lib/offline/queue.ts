import {
  getAllPendingBusinesses,
  updatePendingBusinessStatus,
  deletePendingBusiness,
  type PendingBusinessRecord,
} from "./db";

export async function syncPendingBusiness(record: PendingBusinessRecord): Promise<{ ok: boolean; error?: string }> {
  await updatePendingBusinessStatus(record.clientRecordId, "syncing");

  const formData = new FormData();
  formData.set("payload", JSON.stringify(record.payload));
  if (record.photoBlob) {
    formData.set("photo", record.photoBlob, record.photoFileName ?? "photo.jpg");
  }
  record.additionalPhotoBlobs.forEach((blob, i) => {
    formData.append("additionalPhotos", blob, `photo-${i}.jpg`);
  });

  try {
    const res = await fetch("/api/businesses/sync", { method: "POST", body: formData });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message = body?.error ?? `Sync failed (${res.status})`;
      await updatePendingBusinessStatus(record.clientRecordId, "error", message);
      return { ok: false, error: message };
    }
    await deletePendingBusiness(record.clientRecordId);
    return { ok: true };
  } catch {
    await updatePendingBusinessStatus(record.clientRecordId, "pending");
    return { ok: false, error: "Network error — still queued." };
  }
}

export async function syncAllPending(): Promise<{ synced: number; failed: number }> {
  const pending = (await getAllPendingBusinesses()).filter((r) => r.syncStatus !== "syncing");
  let synced = 0;
  let failed = 0;
  for (const record of pending) {
    const result = await syncPendingBusiness(record);
    if (result.ok) synced += 1;
    else failed += 1;
  }
  return { synced, failed };
}
