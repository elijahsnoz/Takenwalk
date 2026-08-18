import { prisma } from "@/lib/prisma";
import { AdminFieldMapPageClient } from "./AdminFieldMapPageClient";

export const dynamic = "force-dynamic";

const PIWOYI_FALLBACK_CENTER = { lat: 9.0579, lng: 7.4384 };

export default async function AdminFieldMapPage() {
  const [businesses, serviceArea] = await Promise.all([
    // The founder's own real field data only — demo rows are always hidden here,
    // regardless of DEMO_MODE, so they can never be mistaken for an already-mapped shop.
    prisma.business.findMany({
      where: { isDemoData: false },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceArea.findFirst({ where: { isActive: true } }),
  ]);

  const mapCenter = serviceArea
    ? { lat: serviceArea.centerLatitude, lng: serviceArea.centerLongitude }
    : PIWOYI_FALLBACK_CENTER;

  return (
    <AdminFieldMapPageClient
      businesses={businesses.map((b) => ({
        id: b.id,
        name: b.name,
        latitude: b.latitude,
        longitude: b.longitude,
        category: { key: b.category.key },
        verificationStatus: b.verificationStatus,
      }))}
      mapCenter={mapCenter}
    />
  );
}
