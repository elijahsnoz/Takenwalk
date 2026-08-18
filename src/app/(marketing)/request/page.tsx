import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toPublicBusiness } from "@/lib/dto/business";
import { isDemoModeEnabled } from "@/lib/env";
import { HandDrawnFrame } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function RequestBusinessPickerPage() {
  const businesses = await prisma.business.findMany({
    where: { isPubliclyListed: true, isDemoData: isDemoModeEnabled ? undefined : false },
    include: { category: true, products: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold text-ink">Request a Job</h1>
      <p className="mt-2 text-ink-soft">Which business would you like us to visit?</p>

      {businesses.length === 0 ? (
        <div className="mt-8 rounded-xl border-2 border-dashed border-ink/20 p-10 text-center text-sm text-ink-soft">
          No businesses are mapped yet — check back soon as we add businesses around Piwoyi.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {businesses.map((business) => {
            const publicBusiness = toPublicBusiness(business);
            return (
              <Link key={business.id} href={`/request/${business.slug}`}>
                <HandDrawnFrame className="flex items-center justify-between p-4 hover:bg-cream-soft">
                  <div>
                    <p className="font-semibold text-ink">{publicBusiness.name}</p>
                    <p className="text-sm text-ink-soft">
                      {publicBusiness.category.emoji} {publicBusiness.category.label}
                    </p>
                  </div>
                  <span aria-hidden="true">→</span>
                </HandDrawnFrame>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
