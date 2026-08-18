import { prisma } from "@/lib/prisma";
import { toPublicBusiness } from "@/lib/dto/business";
import { toPublicServiceArea } from "@/lib/dto/serviceArea";
import { isDemoModeEnabled } from "@/lib/env";
import { MapPageClient } from "./MapPageClient";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const [businesses, serviceArea] = await Promise.all([
    prisma.business.findMany({
      where: { isPubliclyListed: true, isDemoData: isDemoModeEnabled ? undefined : false },
      include: { category: true, products: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceArea.findFirst({ where: { isActive: true } }),
  ]);

  return (
    <MapPageClient
      initialBusinesses={businesses.map(toPublicBusiness)}
      serviceArea={serviceArea ? toPublicServiceArea(serviceArea) : null}
    />
  );
}
