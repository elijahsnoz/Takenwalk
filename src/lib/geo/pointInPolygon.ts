type LngLat = [number, number];

export type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: LngLat[][];
};

/** Standard ray-casting test. `polygon` is a single ring of [lng, lat] pairs (GeoJSON order). */
export function isPointInRing(point: { latitude: number; longitude: number }, ring: LngLat[]): boolean {
  const x = point.longitude;
  const y = point.latitude;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }

  return inside;
}

/** Accepts the raw Json value stored in ServiceArea.boundary — returns false for anything malformed rather than throwing. */
export function isPointInServiceArea(point: { latitude: number; longitude: number }, boundary: unknown): boolean {
  if (typeof boundary !== "object" || boundary === null || !("coordinates" in boundary)) {
    return false;
  }
  const outerRing = (boundary as GeoJsonPolygon).coordinates?.[0];
  if (!outerRing) return false;
  return isPointInRing(point, outerRing);
}
