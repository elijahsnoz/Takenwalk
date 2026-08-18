import { nominatimProvider } from "./nominatim";
import type { GeocodingProvider } from "./types";

// The one line to change to swap providers.
const activeProvider: GeocodingProvider = nominatimProvider;

export const geocodeAddress = (address: string) => activeProvider.geocodeAddress(address);
export const reverseGeocode = (latitude: number, longitude: number) =>
  activeProvider.reverseGeocode(latitude, longitude);

export type { GeocodeResult, ReverseGeocodeResult, GeocodingProvider } from "./types";
