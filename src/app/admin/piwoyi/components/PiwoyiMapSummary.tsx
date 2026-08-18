import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BUSINESS_CATEGORY_META } from "@/lib/constants";
import type { BusinessCategoryType } from "@/generated/prisma/enums";

export function PiwoyiMapSummary({ countsByCategory }: { countsByCategory: Record<string, number> }) {
  const total = Object.values(countsByCategory).reduce((sum, n) => sum + n, 0);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Piwoyi Business Map</h2>
        <Button href="/admin/piwoyi/map" size="md" variant="outline">
          Open Map
        </Button>
      </div>

      {total === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">No businesses mapped yet — open the map to add the first one.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(Object.entries(BUSINESS_CATEGORY_META) as [BusinessCategoryType, (typeof BUSINESS_CATEGORY_META)[BusinessCategoryType]][])
            .filter(([key]) => countsByCategory[key])
            .map(([key, meta]) => (
              <li key={key} className="flex items-center justify-between rounded-lg bg-cream-soft px-3 py-2 text-sm">
                <span>
                  {meta.emoji} {meta.label}
                </span>
                <span className="font-semibold text-ink">{countsByCategory[key]}</span>
              </li>
            ))}
        </ul>
      )}
    </Card>
  );
}
