import type { ServiceArea } from "@/generated/prisma/client";

export function toPublicServiceArea(area: ServiceArea) {
  return {
    id: area.id,
    name: area.name,
    boundary: area.boundary,
    centerLatitude: area.centerLatitude,
    centerLongitude: area.centerLongitude,
    defaultZoom: area.defaultZoom,
  };
}

export type PublicServiceArea = ReturnType<typeof toPublicServiceArea>;
