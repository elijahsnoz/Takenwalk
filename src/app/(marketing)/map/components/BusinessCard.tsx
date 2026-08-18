import Link from "next/link";
import type { PublicBusiness } from "@/lib/dto/business";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDistance, haversineDistanceMeters } from "@/lib/geo/haversine";

export function BusinessCard({
  business,
  visitorLocation,
}: {
  business: PublicBusiness;
  visitorLocation?: { latitude: number; longitude: number } | null;
}) {
  const distanceLabel =
    visitorLocation && business.latitude != null && business.longitude != null
      ? formatDistance(
          haversineDistanceMeters(visitorLocation, {
            latitude: business.latitude,
            longitude: business.longitude,
          })
        )
      : null;

  const whatsappHref = business.whatsapp
    ? `https://wa.me/${business.whatsapp.replace(/[^0-9]/g, "")}`
    : null;

  return (
    <div className="rounded-xl border border-ink/10 bg-paper p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{business.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">
              {business.category.emoji} {business.category.label}
            </Badge>
            {business.verificationStatus === "VERIFIED" ? <Badge tone="green">✓ Verified</Badge> : null}
            {business.isOpenNow === true ? <Badge tone="green">Open now</Badge> : null}
            {business.isOpenNow === false ? <Badge tone="red">Closed</Badge> : null}
          </div>
        </div>
        {distanceLabel ? <span className="shrink-0 text-xs font-medium text-ink-soft">{distanceLabel}</span> : null}
      </div>

      {business.productsServices ? (
        <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{business.productsServices}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button href={`/business/${business.slug}`} size="md" variant="outline">
          View Business
        </Button>
        <Button href={`/request/${business.slug}`} size="md" variant="primary">
          Request Something
        </Button>
        {business.phone ? (
          <Button href={`tel:${business.phone}`} size="md" variant="ghost">
            Call
          </Button>
        ) : null}
        {whatsappHref ? (
          <Link
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border-[var(--stroke-hand)] border-transparent px-5 py-2.5 text-sm font-semibold text-green hover:border-ink"
          >
            WhatsApp
          </Link>
        ) : null}
      </div>
    </div>
  );
}
