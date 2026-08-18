import type { BusinessCategoryType } from "@/generated/prisma/enums";
import { BUSINESS_CATEGORY_META } from "@/lib/constants";

const PIN_PATH =
  "M16 0C7.163 0 0 7.163 0 16c0 11.5 16 24 16 24s16-12.5 16-24C32 7.163 24.837 0 16 0z";

// Small, centered (16,13), ~12x12 glyphs — kept deliberately simple so the pin
// reads clearly at map scale rather than as a detailed illustration.
const GLYPHS: Record<BusinessCategoryType, string> = {
  GENERAL_SHOP: '<path d="M10 18v-6h12v6M8 12l8-5 8 5" fill="none" stroke="white" stroke-width="2" stroke-linejoin="round"/>',
  FOODSTUFF: '<circle cx="16" cy="13" r="5" fill="white"/>',
  POS: '<rect x="9" y="8" width="14" height="10" rx="2" fill="white"/><rect x="9" y="11" width="14" height="2.5" fill="var(--pin-color)"/>',
  FOOD_VENDOR: '<path d="M8 12c0 5 4 8 8 8s8-3 8-8" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>',
  PHARMACY_HEALTH: '<path d="M16 7v12M10 13h12" stroke="white" stroke-width="3" stroke-linecap="round"/>',
  FASHION: '<path d="M12 8l4 3 4-3 3 4-3 2v9h-8v-9l-3-2z" fill="white"/>',
  PHONE_TECH: '<rect x="11" y="6" width="10" height="15" rx="2" fill="white"/><circle cx="16" cy="18.5" r="1" fill="var(--pin-color)"/>',
  REPAIR_SERVICE: '<path d="M9 19l6-6M17 9a3 3 0 104 4l-2-2h-2z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  HOUSEHOLD: '<path d="M8 13h16l-2 8H10z" fill="white"/><path d="M11 13a5 5 0 0110 0" fill="none" stroke="white" stroke-width="2"/>',
  OTHER: '<circle cx="16" cy="13" r="5" fill="none" stroke="white" stroke-width="2"/>',
};

function buildPinSvg(colorHex: string, glyph: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40" style="--pin-color:${colorHex}">
    <path d="${PIN_PATH}" fill="${colorHex}" stroke="#1a1a1a" stroke-width="1.5"/>
    ${glyph.replaceAll("var(--pin-color)", colorHex)}
  </svg>`;
}

const iconCache = new Map<BusinessCategoryType, string>();

export function getMarkerIconUrl(category: BusinessCategoryType): string {
  const cached = iconCache.get(category);
  if (cached) return cached;

  const meta = BUSINESS_CATEGORY_META[category];
  const svg = buildPinSvg(meta.colorHex, GLYPHS[category]);
  const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  iconCache.set(category, url);
  return url;
}

export const MARKER_ICON_SIZE = { width: 32, height: 40 };
export const MARKER_ICON_ANCHOR = { x: 16, y: 40 };
