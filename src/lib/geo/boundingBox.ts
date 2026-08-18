const METERS_PER_DEGREE_LAT = 111320;

/** Cheap pre-filter box for a DB WHERE clause — pair with haversineDistanceMeters for the precise check. */
export function boundingBoxAround(
  center: { latitude: number; longitude: number },
  radiusMeters: number
) {
  const latDelta = radiusMeters / METERS_PER_DEGREE_LAT;
  const lngDelta =
    radiusMeters / (METERS_PER_DEGREE_LAT * Math.cos((center.latitude * Math.PI) / 180));

  return {
    minLat: center.latitude - latDelta,
    maxLat: center.latitude + latDelta,
    minLng: center.longitude - lngDelta,
    maxLng: center.longitude + lngDelta,
  };
}
