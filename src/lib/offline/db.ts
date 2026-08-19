import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type PendingBusinessPayload = {
  clientRecordId: string;
  name: string;
  categoryKey: string;
  ownerName?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  description?: string;
  productsServices?: string;
  topRequestedProducts: string[];
  openingHours?: { day: number; opens: string; closes: string; closed: boolean }[];
  paymentMethods: string[];
  pickupAvailable: boolean;
  whatsappOrderingAvailable: boolean;
  showPhonePublicly: boolean;
  showWhatsappPublicly: boolean;
  notes?: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  locationSource: "GPS" | "MANUAL" | "VERIFIED";
};

export type PendingBusinessRecord = {
  clientRecordId: string;
  payload: PendingBusinessPayload;
  photoBlob: Blob | null;
  photoFileName: string | null;
  additionalPhotoBlobs: Blob[];
  syncStatus: "pending" | "syncing" | "synced" | "error";
  syncError?: string;
  createdAt: number;
  updatedAt: number;
};

interface FieldCaptureDB extends DBSchema {
  pendingBusinesses: {
    key: string;
    value: PendingBusinessRecord;
    indexes: { "by-syncStatus": string; "by-createdAt": number };
  };
}

const SYNC_CHANNEL_NAME = "takenwalk-sync";
let dbPromise: Promise<IDBPDatabase<FieldCaptureDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<FieldCaptureDB>("takenwalk-field-capture", 1, {
      upgrade(db) {
        const store = db.createObjectStore("pendingBusinesses", { keyPath: "clientRecordId" });
        store.createIndex("by-syncStatus", "syncStatus");
        store.createIndex("by-createdAt", "createdAt");
      },
    });
  }
  return dbPromise;
}

function notifyChange() {
  new BroadcastChannel(SYNC_CHANNEL_NAME).postMessage("changed");
}

export function createPendingBusinessRecord(
  payload: PendingBusinessPayload,
  photo: File | null,
  additionalPhotos: File[] = []
): PendingBusinessRecord {
  const now = Date.now();
  return {
    clientRecordId: payload.clientRecordId,
    payload,
    photoBlob: photo,
    photoFileName: photo?.name ?? null,
    additionalPhotoBlobs: additionalPhotos,
    syncStatus: "pending",
    createdAt: now,
    updatedAt: now,
  };
}

export async function savePendingBusiness(record: PendingBusinessRecord) {
  const db = await getDb();
  await db.put("pendingBusinesses", record);
  notifyChange();
}

export async function getAllPendingBusinesses(): Promise<PendingBusinessRecord[]> {
  const db = await getDb();
  const all = await db.getAll("pendingBusinesses");
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function updatePendingBusinessStatus(
  clientRecordId: string,
  syncStatus: PendingBusinessRecord["syncStatus"],
  syncError?: string
) {
  const db = await getDb();
  const record = await db.get("pendingBusinesses", clientRecordId);
  if (!record) return;
  record.syncStatus = syncStatus;
  record.syncError = syncError;
  record.updatedAt = Date.now();
  await db.put("pendingBusinesses", record);
  notifyChange();
}

export async function deletePendingBusiness(clientRecordId: string) {
  const db = await getDb();
  await db.delete("pendingBusinesses", clientRecordId);
  notifyChange();
}

export function subscribeToSyncChanges(callback: () => void): () => void {
  const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  channel.onmessage = callback;
  return () => channel.close();
}
