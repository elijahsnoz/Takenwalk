"use client";

import { useCallback, useState } from "react";

export type VisitorLocationStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

/**
 * On-demand only — never requests location on mount. Permission is asked
 * for the first time a person taps "Use My Location", per the product
 * requirement to never prompt before someone has chosen a feature that
 * needs it, and this never subscribes to continuous position updates.
 */
export function useVisitorLocation() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [status, setStatus] = useState<VisitorLocationStatus>("idle");

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setStatus("granted");
      },
      () => setStatus("denied"),
      { maximumAge: 60_000, timeout: 10_000 }
    );
  }, []);

  return { location, status, requestLocation };
}
