"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function GpsCaptureControl({
  onResult,
  onError,
  label = "📍 Capture Current Location",
}: {
  onResult: (position: { lat: number; lng: number; accuracy: number }) => void;
  onError: (message: string) => void;
  label?: string;
}) {
  const [capturing, setCapturing] = useState(false);
  const supported =
    typeof window !== "undefined" && window.isSecureContext && "geolocation" in navigator;

  function capture() {
    if (!supported) {
      onError("Geolocation needs a secure (HTTPS, or localhost) connection and browser permission.");
      return;
    }
    setCapturing(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCapturing(false);
        onResult({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        setCapturing(false);
        onError(error.message || "Could not get your location — check permissions and try again.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  if (!supported) {
    return <p className="text-sm text-ink-soft">📍 Location capture needs a secure (HTTPS) connection.</p>;
  }

  return (
    <Button type="button" onClick={capture} disabled={capturing} variant="primary">
      {capturing ? "Capturing…" : label}
    </Button>
  );
}
