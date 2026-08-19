"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Checkbox, Label } from "@/components/ui/Field";
import { BUSINESS_CATEGORY_META } from "@/lib/constants";
import { AdminFieldMap } from "./AdminFieldMap";
import { GpsCaptureControl } from "./GpsCaptureControl";
import { ManualPinControl } from "./ManualPinControl";
import { AddressLookupControl } from "./AddressLookupControl";
import { ManualCoordinatesControl } from "./ManualCoordinatesControl";
import { AccuracyBadge } from "./AccuracyBadge";
import { savePendingBusiness, createPendingBusinessRecord, type PendingBusinessPayload } from "@/lib/offline/db";
import { syncPendingBusiness } from "@/lib/offline/queue";
import type { BusinessCategoryType } from "@/generated/prisma/enums";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PAYMENT_METHODS = [
  { key: "CASH", label: "Cash" },
  { key: "POS_CARD", label: "POS / Card" },
  { key: "BANK_TRANSFER", label: "Bank Transfer" },
  { key: "MOBILE_MONEY", label: "Mobile Money" },
] as const;

type LocationState =
  | { status: "idle" }
  | { status: "placing" }
  | { status: "captured"; lat: number; lng: number; accuracy: number; source: "GPS" | "MANUAL" }
  | { status: "gps_error"; message: string };

type ExistingBusiness = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  category: { key: BusinessCategoryType };
};

export function BusinessFormDrawer({
  open,
  onClose,
  onSaved,
  mapCenter,
  existingBusinesses,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  mapCenter: { lat: number; lng: number };
  existingBusinesses: ExistingBusiness[];
}) {
  const [location, setLocation] = useState<LocationState>({ status: "idle" });
  const [address, setAddress] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<File[]>([]);
  const [closedDays, setClosedDays] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState(false);

  const pendingPosition =
    location.status === "captured" || location.status === "placing"
      ? location.status === "captured"
        ? { lat: location.lat, lng: location.lng }
        : null
      : null;

  function confirmLocation(lat: number, lng: number, accuracy: number, source: "GPS" | "MANUAL") {
    setLocation({ status: "captured", lat, lng, accuracy, source });
    setAddress(null);
    setAddressLoading(true);
    fetch(`/api/geocode?latitude=${lat}&longitude=${lng}`)
      .then((res) => res.json())
      .then((json) => setAddress(json?.data?.address ?? null))
      .catch(() => setAddress(null))
      .finally(() => setAddressLoading(false));
  }

  function handleMapClick(position: { lat: number; lng: number }) {
    confirmLocation(position.lat, position.lng, 0, "MANUAL");
  }

  function handleMarkerDrag(position: { lat: number; lng: number }) {
    confirmLocation(position.lat, position.lng, 0, "MANUAL");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (location.status !== "captured") return;

    const formData = new FormData(event.currentTarget);
    const openingHours = DAYS.map((_, day) => ({
      day,
      opens: String(formData.get("opens") ?? "08:00"),
      closes: String(formData.get("closes") ?? "20:00"),
      closed: closedDays.has(day),
    }));

    const payload: PendingBusinessPayload = {
      clientRecordId: crypto.randomUUID(),
      name: String(formData.get("name") ?? ""),
      categoryKey: String(formData.get("categoryKey") ?? ""),
      ownerName: String(formData.get("ownerName") ?? "") || undefined,
      phone: String(formData.get("phone") ?? "") || undefined,
      whatsapp: String(formData.get("whatsapp") ?? "") || undefined,
      address: String(formData.get("address") ?? "") || undefined,
      description: String(formData.get("description") ?? "") || undefined,
      productsServices: String(formData.get("productsServices") ?? "") || undefined,
      topRequestedProducts: String(formData.get("topRequestedProducts") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5),
      openingHours,
      paymentMethods: PAYMENT_METHODS.filter((m) => formData.get(`payment_${m.key}`)).map((m) => m.key),
      pickupAvailable: formData.get("pickupAvailable") === "on",
      whatsappOrderingAvailable: formData.get("whatsappOrderingAvailable") === "on",
      showPhonePublicly: formData.get("showPhonePublicly") === "on",
      showWhatsappPublicly: formData.get("showWhatsappPublicly") === "on",
      notes: String(formData.get("notes") ?? "") || undefined,
      latitude: location.lat,
      longitude: location.lng,
      accuracyMeters: location.accuracy || undefined,
      locationSource: location.source,
    };

    const record = createPendingBusinessRecord(payload, photo, additionalPhotos);

    await savePendingBusiness(record);
    setSaved(true);
    void syncPendingBusiness(record);

    setTimeout(() => {
      setSaved(false);
      resetForm();
      onSaved();
      onClose();
    }, 900);
  }

  function resetForm() {
    setLocation({ status: "idle" });
    setAddress(null);
    setPhoto(null);
    setAdditionalPhotos([]);
    setClosedDays(new Set());
  }

  return (
    <Drawer open={open} onClose={onClose} title="Add Business">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Location</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <GpsCaptureControl
              onResult={(pos) => confirmLocation(pos.lat, pos.lng, pos.accuracy, "GPS")}
              onError={(message) => setLocation({ status: "gps_error", message })}
            />
            <ManualPinControl
              active={location.status === "placing"}
              onToggle={() => setLocation(location.status === "placing" ? { status: "idle" } : { status: "placing" })}
            />
          </div>

          <div className="mt-2">
            <AddressLookupControl onFound={(pos) => confirmLocation(pos.lat, pos.lng, 0, "MANUAL")} />
          </div>

          <div className="mt-2">
            <ManualCoordinatesControl onSubmit={(pos) => confirmLocation(pos.lat, pos.lng, 0, "MANUAL")} />
          </div>

          {location.status === "gps_error" ? (
            <p className="mt-2 text-sm text-red">{location.message}</p>
          ) : null}

          <div className="mt-3 h-64">
            <AdminFieldMap
              center={pendingPosition ?? mapCenter}
              existingBusinesses={existingBusinesses}
              pendingPosition={pendingPosition}
              placementMode={location.status === "placing"}
              onMapClick={handleMapClick}
              onPendingMarkerDrag={handleMarkerDrag}
            />
          </div>

          {location.status === "captured" ? (
            <div className="mt-3 flex flex-col gap-2">
              <AccuracyBadge accuracyMeters={location.accuracy} />
              <p className="text-xs text-ink-soft">
                {addressLoading ? "Looking up address…" : address ?? "Address unavailable — coordinates are still saved."}
              </p>
              <p className="text-xs text-ink-soft">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)} · source: {location.source}
              </p>
              <ManualPinControl active={false} onToggle={() => setLocation({ status: "placing" })} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">Capture GPS or place a pin before saving.</p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Business Details</h3>
          <Label htmlFor="name">
            Business name
            <Input id="name" name="name" required maxLength={120} />
          </Label>
          <Label htmlFor="categoryKey">
            Category
            <Select id="categoryKey" name="categoryKey" required defaultValue="">
              <option value="" disabled>
                Choose a category
              </option>
              {Object.entries(BUSINESS_CATEGORY_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.emoji} {meta.label}
                </option>
              ))}
            </Select>
          </Label>
          <Label htmlFor="ownerName">
            Owner / business contact name
            <Input id="ownerName" name="ownerName" maxLength={120} />
          </Label>
          <Label htmlFor="phone">
            Business phone
            <Input id="phone" name="phone" type="tel" maxLength={20} />
          </Label>
          <Label htmlFor="whatsapp">
            WhatsApp
            <Input id="whatsapp" name="whatsapp" type="tel" maxLength={20} />
          </Label>
          <Label htmlFor="address">
            Address
            <Input id="address" name="address" maxLength={300} />
          </Label>
          <Label htmlFor="description">
            Description
            <Textarea id="description" name="description" rows={2} maxLength={2000} />
          </Label>
          <Label htmlFor="productsServices">
            Products / services
            <Textarea id="productsServices" name="productsServices" rows={2} maxLength={2000} />
          </Label>
          <Label htmlFor="topRequestedProducts">
            Top 5 requested products (comma-separated)
            <Input id="topRequestedProducts" name="topRequestedProducts" placeholder="Bread, Eggs, Milk" />
          </Label>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Opening Hours</h3>
          <div className="flex gap-3">
            <Label htmlFor="opens">
              Opens
              <Input id="opens" name="opens" type="time" defaultValue="08:00" />
            </Label>
            <Label htmlFor="closes">
              Closes
              <Input id="closes" name="closes" type="time" defaultValue="20:00" />
            </Label>
          </div>
          <div className="flex flex-wrap gap-3">
            {DAYS.map((day, index) => (
              <Checkbox
                key={day}
                label={day}
                checked={closedDays.has(index)}
                onChange={(e) => {
                  setClosedDays((prev) => {
                    const next = new Set(prev);
                    if (e.target.checked) next.add(index);
                    else next.delete(index);
                    return next;
                  });
                }}
              />
            ))}
          </div>
          <p className="text-xs text-ink-soft">Checked days are closed.</p>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Payment &amp; Ordering</h3>
          <div className="flex flex-wrap gap-3">
            {PAYMENT_METHODS.map((method) => (
              <Checkbox key={method.key} name={`payment_${method.key}`} label={method.label} />
            ))}
          </div>
          <Checkbox name="pickupAvailable" label="Pickup available" />
          <Checkbox name="whatsappOrderingAvailable" label="WhatsApp ordering available" />
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Public Visibility</h3>
          <Checkbox name="showPhonePublicly" label="Show phone number publicly" />
          <Checkbox name="showWhatsappPublicly" label="Show WhatsApp publicly" />
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Storefront Photo</h3>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="text-sm text-ink-soft"
          />
          <p className="text-xs text-ink-soft">More photos (optional) — products, interior, signage</p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={(e) => setAdditionalPhotos(Array.from(e.target.files ?? []))}
            className="text-sm text-ink-soft"
          />
        </section>

        <Label htmlFor="notes">
          Notes (internal only, never shown publicly)
          <Textarea id="notes" name="notes" rows={2} maxLength={2000} />
        </Label>

        <Button type="submit" size="lg" disabled={location.status !== "captured" || saved}>
          {saved ? "Saved ✓" : "Save Business"}
        </Button>
      </form>
    </Drawer>
  );
}
