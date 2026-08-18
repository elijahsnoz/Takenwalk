import type { PublicBusiness } from "@/lib/dto/business";
import { BusinessCard } from "./BusinessCard";
import { haversineDistanceMeters } from "@/lib/geo/haversine";

export function ListView({
  businesses,
  visitorLocation,
}: {
  businesses: PublicBusiness[];
  visitorLocation?: { latitude: number; longitude: number } | null;
}) {
  if (businesses.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-ink/20 p-10 text-center text-sm text-ink-soft">
        No businesses match this filter yet.
      </div>
    );
  }

  const sorted = visitorLocation
    ? [...businesses].sort((a, b) => {
        if (a.latitude == null || a.longitude == null) return 1;
        if (b.latitude == null || b.longitude == null) return -1;
        return (
          haversineDistanceMeters(visitorLocation, { latitude: a.latitude, longitude: a.longitude }) -
          haversineDistanceMeters(visitorLocation, { latitude: b.latitude, longitude: b.longitude })
        );
      })
    : businesses;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {sorted.map((business) => (
        <BusinessCard key={business.id} business={business} visitorLocation={visitorLocation} />
      ))}
    </div>
  );
}
