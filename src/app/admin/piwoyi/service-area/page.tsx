import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function AdminServiceAreaPage() {
  const serviceArea = await prisma.serviceArea.findFirst({ where: { isActive: true } });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">Piwoyi Service Area</h1>
        <p className="text-sm text-ink-soft">
          The operating zone shown on the public map. Editing is not available yet — update via
          Prisma Studio or a database migration for now.
        </p>
      </div>

      {!serviceArea ? (
        <Card className="p-8 text-center text-sm text-ink-soft">No service area configured yet.</Card>
      ) : (
        <Card className="p-5">
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-ink-soft">Name</dt><dd className="text-ink">{serviceArea.name}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Center</dt><dd className="text-ink">{serviceArea.centerLatitude}, {serviceArea.centerLongitude}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Default zoom</dt><dd className="text-ink">{serviceArea.defaultZoom}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Active</dt><dd className="text-ink">{serviceArea.isActive ? "Yes" : "No"}</dd></div>
          </dl>
          <details className="mt-4 text-xs text-ink-soft">
            <summary className="cursor-pointer font-semibold text-ink">Boundary (GeoJSON)</summary>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-cream-soft p-3">
              {JSON.stringify(serviceArea.boundary, null, 2)}
            </pre>
          </details>
        </Card>
      )}
    </div>
  );
}
