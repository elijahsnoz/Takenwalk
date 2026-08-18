import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BUSINESS_CATEGORY_META } from "@/lib/constants";
import { BusinessAdminActions } from "./BusinessAdminActions";

export const dynamic = "force-dynamic";

export default async function AdminBusinessDetailPage({ params }: PageProps<"/admin/piwoyi/businesses/[id]">) {
  const { id } = await params;

  const business = await prisma.business.findUnique({
    where: { id },
    include: { category: true, locations: { orderBy: { capturedAt: "desc" } }, visits: true, products: true },
  });

  if (!business) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">
            {BUSINESS_CATEGORY_META[business.category.key].emoji} {business.name}
          </h1>
          <div className="mt-2 flex gap-2">
            <Badge tone={business.verificationStatus === "VERIFIED" ? "green" : "gold"}>
              {business.verificationStatus}
            </Badge>
            <Badge tone={business.isPubliclyListed ? "blue" : "neutral"}>
              {business.isPubliclyListed ? "Public" : "Hidden"}
            </Badge>
          </div>
        </div>
        <BusinessAdminActions
          businessId={business.id}
          verificationStatus={business.verificationStatus}
          isPubliclyListed={business.isPubliclyListed}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Contact</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-ink-soft">Owner</dt><dd className="text-ink">{business.ownerName ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Phone</dt><dd className="text-ink">{business.phone ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">WhatsApp</dt><dd className="text-ink">{business.whatsapp ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Address</dt><dd className="text-ink">{business.address ?? "—"}</dd></div>
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Location</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-ink-soft">Coordinates</dt><dd className="text-ink">{business.latitude?.toFixed(6)}, {business.longitude?.toFixed(6)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Accuracy</dt><dd className="text-ink">±{business.locationAccuracyMeters?.toFixed(0) ?? "—"}m</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Source</dt><dd className="text-ink">{business.locationSource ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Last visited</dt><dd className="text-ink">{business.lastVisitedAt?.toLocaleDateString() ?? "—"}</dd></div>
          </dl>
        </Card>

        {business.notes ? (
          <Card className="p-5 sm:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Internal Notes</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-ink">{business.notes}</p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
