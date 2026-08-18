export type GeocodeResult = {
  latitude: number;
  longitude: number;
  displayName: string;
};

export type ReverseGeocodeResult = {
  displayName: string;
};

/**
 * The one boundary the rest of the app talks to. Swapping providers (a paid
 * OSM-compatible service, a self-hosted Nominatim, our own infra) means
 * writing a new file that implements this and changing the one wire-up in
 * index.ts — no call site anywhere else needs to change.
 */
export interface GeocodingProvider {
  geocodeAddress(address: string): Promise<GeocodeResult | null>;
  reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResult | null>;
}
