"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function AddressLookupControl({
  onFound,
}: {
  onFound: (position: { lat: number; lng: number }) => void;
}) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    if (address.trim().length < 3) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/geocode/forward?address=${encodeURIComponent(address)}`);
    const body = await res.json().catch(() => null);
    setLoading(false);

    if (!body?.data) {
      setError(body?.error ?? "Could not find that address.");
      return;
    }
    onFound({ lat: body.data.latitude, lng: body.data.longitude });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Type an address to look up…"
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={lookup} disabled={loading || address.trim().length < 3}>
          {loading ? "Looking up…" : "🔍 Look Up"}
        </Button>
      </div>
      {error ? <p className="text-xs text-red">{error}</p> : null}
      <p className="text-xs text-ink-soft">
        This just drops a starting pin — drag it to correct the exact spot before saving.
      </p>
    </div>
  );
}
