"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";

export function ManualCoordinatesControl({
  onSubmit,
}: {
  onSubmit: (position: { lat: number; lng: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const parsedLat = Number.parseFloat(lat);
    const parsedLng = Number.parseFloat(lng);

    if (!Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      setError("Latitude must be a number between -90 and 90.");
      return;
    }
    if (!Number.isFinite(parsedLng) || parsedLng < -180 || parsedLng > 180) {
      setError("Longitude must be a number between -180 and 180.");
      return;
    }
    setError(null);
    onSubmit({ lat: parsedLat, lng: parsedLng });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left text-xs font-semibold text-ink-soft underline hover:text-ink"
      >
        ✏️ Enter Location Manually
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-ink/10 bg-cream-soft p-3">
      <p className="text-xs text-ink-soft">
        Works even if GPS and the map aren&apos;t available — type coordinates directly (e.g. from
        another maps app).
      </p>
      <div className="flex flex-wrap gap-2">
        <Label htmlFor="manualLat">
          Latitude
          <Input
            id="manualLat"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="9.0579"
            inputMode="decimal"
            className="w-32"
          />
        </Label>
        <Label htmlFor="manualLng">
          Longitude
          <Input
            id="manualLng"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="7.4384"
            inputMode="decimal"
            className="w-32"
          />
        </Label>
      </div>
      {error ? <p className="text-xs text-red">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="button" size="md" variant="outline" onClick={handleSubmit}>
          Use These Coordinates
        </Button>
        <Button type="button" size="md" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
