import type { Map as MapLibreMap } from "maplibre-gl";
import { ensureOppositeWinding } from "@/lib/geo/polygonWinding";
import type { GeoJsonPolygon } from "@/lib/geo/pointInPolygon";

const DIM_SOURCE_ID = "piwoyi-zone-dim";
const OUTLINE_SOURCE_ID = "piwoyi-zone-outline";
const DIM_BOX_DEGREES = 0.5;

/** Dims everything outside the Piwoyi zone and draws its outline. GeoJSON needs no lat/lng conversion for MapLibre — it's native. */
export function addZoneOverlay(
  map: MapLibreMap,
  boundary: GeoJsonPolygon,
  center: { lat: number; lng: number }
) {
  const outerRing: [number, number][] = [
    [center.lng - DIM_BOX_DEGREES, center.lat - DIM_BOX_DEGREES],
    [center.lng + DIM_BOX_DEGREES, center.lat - DIM_BOX_DEGREES],
    [center.lng + DIM_BOX_DEGREES, center.lat + DIM_BOX_DEGREES],
    [center.lng - DIM_BOX_DEGREES, center.lat + DIM_BOX_DEGREES],
    [center.lng - DIM_BOX_DEGREES, center.lat - DIM_BOX_DEGREES],
  ];
  const zoneRing = ensureOppositeWinding(outerRing, boundary.coordinates[0] as [number, number][]);

  map.addSource(DIM_SOURCE_ID, {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: [outerRing, zoneRing] },
    },
  });
  map.addLayer({
    id: `${DIM_SOURCE_ID}-fill`,
    type: "fill",
    source: DIM_SOURCE_ID,
    paint: { "fill-color": "#1a1a1a", "fill-opacity": 0.35 },
  });

  map.addSource(OUTLINE_SOURCE_ID, {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: [boundary.coordinates[0]] },
    },
  });
  map.addLayer({
    id: `${OUTLINE_SOURCE_ID}-line`,
    type: "line",
    source: OUTLINE_SOURCE_ID,
    paint: { "line-color": "#1a1a1a", "line-width": 2.5 },
  });
}

export function removeZoneOverlay(map: MapLibreMap) {
  for (const layerId of [`${DIM_SOURCE_ID}-fill`, `${OUTLINE_SOURCE_ID}-line`]) {
    if (map.getLayer(layerId)) map.removeLayer(layerId);
  }
  for (const sourceId of [DIM_SOURCE_ID, OUTLINE_SOURCE_ID]) {
    if (map.getSource(sourceId)) map.removeSource(sourceId);
  }
}
