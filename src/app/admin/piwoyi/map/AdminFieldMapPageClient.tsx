"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { AddBusinessButton } from "./components/AddBusinessButton";
import { BusinessFormDrawer } from "./components/BusinessFormDrawer";
import { SyncStatusIndicator } from "./components/SyncStatusIndicator";
import { AdminFieldMap } from "./components/AdminFieldMap";
import { BUSINESS_CATEGORY_META } from "@/lib/constants";
import type { BusinessCategoryType, VerificationStatus } from "@/generated/prisma/enums";

type ExistingBusiness = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  category: { key: BusinessCategoryType };
  verificationStatus: VerificationStatus;
};

export function AdminFieldMapPageClient({
  businesses,
  mapCenter,
}: {
  businesses: ExistingBusiness[];
  mapCenter: { lat: number; lng: number };
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Piwoyi Field Mapping</h1>
          <p className="text-sm text-ink-soft">{businesses.length} businesses mapped so far.</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="self-center">
            <SyncStatusIndicator />
          </div>
          <AddBusinessButton onClick={() => setDrawerOpen(true)} />
        </div>
      </div>

      <div className="h-[480px]">
        <AdminFieldMap center={mapCenter} existingBusinesses={businesses} pendingPosition={null} placementMode={false} />
      </div>

      {businesses.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-ink/20 p-8 text-center text-sm text-ink-soft">
          No businesses mapped yet — tap &quot;+ Add Business&quot; to add the first one.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <div key={business.id} className="rounded-lg border border-ink/10 bg-paper p-3 text-sm">
              <p className="font-medium text-ink">
                {BUSINESS_CATEGORY_META[business.category.key].emoji} {business.name}
              </p>
              <div className="mt-1">
                <Badge tone={business.verificationStatus === "VERIFIED" ? "green" : "gold"}>
                  {business.verificationStatus}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <BusinessFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={() => router.refresh()}
        mapCenter={mapCenter}
        existingBusinesses={businesses}
      />
    </div>
  );
}
