import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BUSINESS_CATEGORY_META } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminBusinessesPage() {
  const businesses = await prisma.business.findMany({
    where: { isDemoData: false },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">Businesses</h1>
        <p className="text-sm text-ink-soft">{businesses.length} businesses in Piwoyi.</p>
      </div>

      {businesses.length === 0 ? (
        <Card className="p-8 text-center text-sm text-ink-soft">
          No businesses yet — add the first one from Piwoyi Map.
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {businesses.map((business) => (
            <Link key={business.id} href={`/admin/piwoyi/businesses/${business.id}`}>
              <Card className="flex items-center justify-between p-4 hover:bg-cream-soft">
                <div>
                  <p className="font-medium text-ink">
                    {BUSINESS_CATEGORY_META[business.category.key].emoji} {business.name}
                  </p>
                  <p className="text-sm text-ink-soft">{business.category.label}</p>
                </div>
                <div className="flex gap-2">
                  <Badge tone={business.verificationStatus === "VERIFIED" ? "green" : "gold"}>
                    {business.verificationStatus}
                  </Badge>
                  <Badge tone={business.isPubliclyListed ? "blue" : "neutral"}>
                    {business.isPubliclyListed ? "Public" : "Hidden"}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
