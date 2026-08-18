import type { GeocodingProvider } from "./types";

const BASE_URL = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";
const USER_AGENT =
  process.env.GEOCODING_USER_AGENT ||
  "TakenWalk/1.0 (contact email not configured — set GEOCODING_USER_AGENT before production use)";

// Nominatim's usage policy caps the public instance at 1 request/second,
// applied across ALL of an app's traffic, not per-client — a single
// in-process throttle is the right scope for this. We only ever call this
// from admin create/edit actions (never on public map load), so this is
// generous, not a real bottleneck.
const MIN_INTERVAL_MS = 1100;
let lastRequestAt = 0;

async function throttle() {
  const wait = MIN_INTERVAL_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();
}

async function nominatimGet(path: string, params: Record<string, string>) {
  await throttle();
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("format", "jsonv2");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) return null;
  return res.json();
}

export const nominatimProvider: GeocodingProvider = {
  async geocodeAddress(address) {
    const results = await nominatimGet("/search", { q: address, limit: "1" }).catch(() => null);
    const first = Array.isArray(results) ? results[0] : null;
    if (!first) return null;
    return {
      latitude: Number.parseFloat(first.lat),
      longitude: Number.parseFloat(first.lon),
      displayName: first.display_name,
    };
  },

  async reverseGeocode(latitude, longitude) {
    const result = await nominatimGet("/reverse", { lat: String(latitude), lon: String(longitude) }).catch(
      () => null
    );
    if (!result?.display_name) return null;
    return { displayName: result.display_name };
  },
};
