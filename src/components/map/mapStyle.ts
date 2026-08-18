/**
 * OpenFreeMap's public instance: genuinely free, no API key, no rate limit,
 * OSM data (https://openfreemap.org). "positron" is a clean light basemap
 * that keeps our own category-colored markers as the visual focus instead of
 * competing with a busy default style. Override via env to swap providers
 * (MapTiler, Stadia, a self-hosted style) without touching component code.
 */
export const MAP_STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://tiles.openfreemap.org/styles/positron";
