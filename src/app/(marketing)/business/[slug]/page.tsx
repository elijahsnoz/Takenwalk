import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toPublicBusiness } from "@/lib/dto/business";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HandDrawnFrame } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/business/[slug]">) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({ where: { slug }, select: { name: true, description: true } });
  if (!business) return {};
  return { title: business.name, description: business.description ?? `${business.name} on TakenWalk — Piwoyi, Abuja.` };
}

export default async function BusinessProfilePage({ params }: PageProps<"/business/[slug]">) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: { category: true, products: true, neighborhood: { include: { city: true } } },
  });

  if (!business || !business.isPubliclyListed) {
    notFound();
  }

  const publicBusiness = toPublicBusiness(business);
  const whatsappHref = publicBusiness.whatsapp
    ? `https://wa.me/${publicBusiness.whatsapp.replace(/[^0-9]/g, "")}`
    : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description ?? undefined,
    image: business.photoUrl ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address ?? undefined,
      addressLocality: business.neighborhood.name,
      addressRegion: business.neighborhood.city.state ?? undefined,
      addressCountry: business.neighborhood.city.country,
    },
    ...(business.latitude != null && business.longitude != null
      ? { geo: { "@type": "GeoCoordinates", latitude: business.latitude, longitude: business.longitude } }
      : {}),
    telephone: business.showPhonePublicly ? (business.phone ?? undefined) : undefined,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        // Business name/description can come from the public, unauthenticated
        // "Add Your Business" lead form — escape "<" so nothing can break out
        // of this script tag (e.g. a name containing "</script>").
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      {publicBusiness.photoUrl ? (
        <HandDrawnFrame className="mb-6 overflow-hidden p-0">
          <Image
            src={publicBusiness.photoUrl}
            alt={publicBusiness.name}
            width={800}
            height={450}
            className="h-56 w-full object-cover sm:h-72"
          />
        </HandDrawnFrame>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">
          {publicBusiness.category.emoji} {publicBusiness.category.label}
        </Badge>
        {publicBusiness.verificationStatus === "VERIFIED" ? <Badge tone="green">✓ Verified</Badge> : null}
        {publicBusiness.isOpenNow === true ? <Badge tone="green">Open now</Badge> : null}
        {publicBusiness.isOpenNow === false ? <Badge tone="red">Closed</Badge> : null}
      </div>

      <h1 className="mt-3 font-display text-4xl font-extrabold text-ink">{publicBusiness.name}</h1>

      {publicBusiness.description ? <p className="mt-3 text-ink-soft">{publicBusiness.description}</p> : null}
      {publicBusiness.address ? (
        <p className="mt-2 text-sm text-ink-soft">
          📍 {publicBusiness.address}, {business.neighborhood.name}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href={`/request/${publicBusiness.slug}`} size="lg" variant="primary">
          Request Something
        </Button>
        {publicBusiness.phone ? (
          <Button href={`tel:${publicBusiness.phone}`} size="lg" variant="outline">
            Call
          </Button>
        ) : null}
        {whatsappHref ? (
          <Button href={whatsappHref} size="lg" variant="ghost">
            WhatsApp
          </Button>
        ) : null}
      </div>

      {publicBusiness.additionalPhotoUrls.length > 0 ? (
        <div className="mt-6 flex gap-3 overflow-x-auto">
          {publicBusiness.additionalPhotoUrls.map((url) => (
            <HandDrawnFrame key={url} className="shrink-0 overflow-hidden p-0">
              <Image src={url} alt="" width={160} height={160} className="h-32 w-32 object-cover" />
            </HandDrawnFrame>
          ))}
        </div>
      ) : null}

      {publicBusiness.productsServices ? (
        <HandDrawnFrame className="mt-8 p-6">
          <h2 className="text-lg font-bold text-ink">Products &amp; Services</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">{publicBusiness.productsServices}</p>
        </HandDrawnFrame>
      ) : null}

      {publicBusiness.topRequestedProducts.length > 0 ? (
        <HandDrawnFrame className="mt-6 p-6">
          <h2 className="text-lg font-bold text-ink">Popular Requests</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {publicBusiness.topRequestedProducts.map((item) => (
              <li key={item}>
                <Badge tone="gold">{item}</Badge>
              </li>
            ))}
          </ul>
        </HandDrawnFrame>
      ) : null}

      <HandDrawnFrame className="mt-6 p-6">
        <h2 className="text-lg font-bold text-ink">Products</h2>
        {publicBusiness.products.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">No products listed yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink/10">
            {publicBusiness.products.map((product) => (
              <li key={product.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink">{product.name}</span>
                {product.priceNaira != null ? (
                  <span className="font-medium text-ink-soft">₦{product.priceNaira.toLocaleString()}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </HandDrawnFrame>
    </div>
  );
}
