"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE_URL } from "@/components/map/mapStyle";
import { getMarkerIconUrl } from "@/components/map/markerIcons";
import type { BusinessCategoryType } from "@/generated/prisma/enums";

type ExistingBusiness = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  category: { key: BusinessCategoryType };
};

function buildPinElement(categoryKey: BusinessCategoryType): HTMLElement {
  const img = document.createElement("img");
  img.src = getMarkerIconUrl(categoryKey);
  img.width = 24;
  img.height = 30;
  img.style.opacity = "0.85";
  return img;
}

export function AdminFieldMap({
  center,
  zoom = 16,
  existingBusinesses,
  pendingPosition,
  placementMode,
  onMapClick,
  onPendingMarkerDrag,
}: {
  center: { lat: number; lng: number };
  zoom?: number;
  existingBusinesses: ExistingBusiness[];
  pendingPosition: { lat: number; lng: number } | null;
  placementMode: boolean;
  onMapClick?: (position: { lat: number; lng: number }) => void;
  onPendingMarkerDrag?: (position: { lat: number; lng: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const existingMarkersRef = useRef<Marker[]>([]);
  const pendingMarkerRef = useRef<Marker | null>(null);
  const onMapClickRef = useRef(onMapClick);
  const onDragRef = useRef(onPendingMarkerDrag);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    onMapClickRef.current = onMapClick;
    onDragRef.current = onPendingMarkerDrag;
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [center.lng, center.lat],
      zoom,
    });
    mapRef.current = map;
    map.on("error", () => setStatus("error"));
    map.on("load", () => setStatus("ready"));
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Map is created once; recentering happens via the pendingPosition effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    existingMarkersRef.current.forEach((marker) => marker.remove());
    existingMarkersRef.current = existingBusinesses
      .filter((b) => b.latitude != null && b.longitude != null)
      .map((b) =>
        new Marker({ element: buildPinElement(b.category.key), anchor: "bottom" })
          .setLngLat([b.longitude as number, b.latitude as number])
          .addTo(map)
      );
  }, [existingBusinesses, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    if (!placementMode) return;

    function handleClick(e: { lngLat: { lat: number; lng: number } }) {
      onMapClickRef.current?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    }
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [placementMode, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;

    if (!pendingPosition) {
      pendingMarkerRef.current?.remove();
      pendingMarkerRef.current = null;
      return;
    }

    if (!pendingMarkerRef.current) {
      pendingMarkerRef.current = new Marker({ color: "#d97b3f", draggable: true })
        .setLngLat([pendingPosition.lng, pendingPosition.lat])
        .addTo(map);
      pendingMarkerRef.current.on("dragend", () => {
        const lngLat = pendingMarkerRef.current?.getLngLat();
        if (lngLat) onDragRef.current?.({ lat: lngLat.lat, lng: lngLat.lng });
      });
    } else {
      pendingMarkerRef.current.setLngLat([pendingPosition.lng, pendingPosition.lat]);
    }

    map.easeTo({ center: [pendingPosition.lng, pendingPosition.lat] });
  }, [pendingPosition, status]);

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-xl">
      {status !== "ready" ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-cream-soft text-sm text-ink-soft">
          {status === "error" ? "Map failed to load — check your connection and refresh." : "Loading map…"}
        </div>
      ) : null}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
