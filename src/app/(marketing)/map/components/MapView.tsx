"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, NavigationControl, GeolocateControl, type GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE_URL } from "@/components/map/mapStyle";
import { addZoneOverlay } from "@/components/map/ZonePolygonOverlay";
import type { PublicBusiness } from "@/lib/dto/business";
import type { PublicServiceArea } from "@/lib/dto/serviceArea";
import type { GeoJsonPolygon } from "@/lib/geo/pointInPolygon";

const PIWOYI_FALLBACK_CENTER = { lat: 9.0579, lng: 7.4384 };
const BUSINESSES_SOURCE_ID = "businesses";

function toFeatureCollection(businesses: PublicBusiness[]) {
  return {
    type: "FeatureCollection" as const,
    features: businesses
      .filter((b) => b.latitude != null && b.longitude != null)
      .map((b) => ({
        type: "Feature" as const,
        properties: { id: b.id, name: b.name, colorHex: b.category.colorHex },
        geometry: { type: "Point" as const, coordinates: [b.longitude as number, b.latitude as number] },
      })),
  };
}

export default function MapView({
  businesses,
  serviceArea,
  onSelectBusiness,
}: {
  businesses: PublicBusiness[];
  serviceArea: PublicServiceArea | null;
  onSelectBusiness: (business: PublicBusiness) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const businessesRef = useRef(businesses);
  const onSelectRef = useRef(onSelectBusiness);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    businessesRef.current = businesses;
    onSelectRef.current = onSelectBusiness;
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center = serviceArea
      ? { lat: serviceArea.centerLatitude, lng: serviceArea.centerLongitude }
      : PIWOYI_FALLBACK_CENTER;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [center.lng, center.lat],
      zoom: serviceArea?.defaultZoom ?? 15,
    });
    mapRef.current = map;

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: false }),
      "top-right"
    );

    map.on("error", () => setStatus("error"));

    map.on("load", () => {
      if (serviceArea) {
        addZoneOverlay(map, serviceArea.boundary as unknown as GeoJsonPolygon, center);
      }

      map.addSource(BUSINESSES_SOURCE_ID, {
        type: "geojson",
        data: toFeatureCollection(businessesRef.current),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: BUSINESSES_SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#4c6444",
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 25, 26],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#f7f3ea",
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: BUSINESSES_SOURCE_ID,
        filter: ["has", "point_count"],
        layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 13 },
        paint: { "text-color": "#f7f3ea" },
      });
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: BUSINESSES_SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "colorHex"],
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#1a1a1a",
        },
      });

      map.on("click", "clusters", (e) => {
        const feature = map.queryRenderedFeatures(e.point, { layers: ["clusters"] })[0];
        const clusterId = feature?.properties?.cluster_id;
        const source = map.getSource(BUSINESSES_SOURCE_ID) as GeoJSONSource;
        if (clusterId == null) return;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          const geometry = feature.geometry;
          if (geometry.type !== "Point") return;
          map.easeTo({ center: geometry.coordinates as [number, number], zoom });
        });
      });

      map.on("click", "unclustered-point", (e) => {
        const id = e.features?.[0]?.properties?.id;
        const found = businessesRef.current.find((b) => b.id === id);
        if (found) onSelectRef.current(found);
      });

      for (const layerId of ["clusters", "unclustered-point"]) {
        map.on("mouseenter", layerId, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layerId, () => {
          map.getCanvas().style.cursor = "";
        });
      }

      setStatus("ready");
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Map instance is created once; businesses/serviceArea updates are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    const source = map.getSource(BUSINESSES_SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(toFeatureCollection(businesses));
  }, [businesses, status]);

  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-xl">
      {status !== "ready" ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-cream-soft text-sm text-ink-soft">
          {status === "error" ? "Map failed to load — check your connection and refresh." : "Loading map…"}
        </div>
      ) : null}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
