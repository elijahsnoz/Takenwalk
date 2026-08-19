import type { Business, BusinessCategory, BusinessProduct } from "@/generated/prisma/client";
import { isOpenNow } from "@/lib/geo/isOpenNow";

type BusinessWithRelations = Business & {
  category: BusinessCategory;
  products?: BusinessProduct[];
};

/**
 * The only allow-list boundary between a Business row and anything public.
 * Contact fields are gated by the business's own opt-in flags — never spread
 * a raw Prisma row into a public response instead of going through this.
 */
export function toPublicBusiness(business: BusinessWithRelations) {
  return {
    id: business.id,
    slug: business.slug,
    name: business.name,
    category: {
      key: business.category.key,
      label: business.category.label,
      emoji: business.category.emoji,
      colorHex: business.category.colorHex,
    },
    address: business.address,
    description: business.description,
    productsServices: business.productsServices,
    topRequestedProducts: business.topRequestedProducts,
    photoUrl: business.photoUrl,
    additionalPhotoUrls: business.additionalPhotoUrls,
    latitude: business.latitude,
    longitude: business.longitude,
    isOpenNow: isOpenNow(business.openingHours),
    pickupAvailable: business.pickupAvailable,
    whatsappOrderingAvailable: business.whatsappOrderingAvailable,
    verificationStatus: business.verificationStatus,
    phone: business.showPhonePublicly ? business.phone : null,
    whatsapp: business.showWhatsappPublicly ? business.whatsapp : null,
    products: (business.products ?? [])
      .filter((p) => p.isAvailable)
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceNaira: p.priceNaira ? p.priceNaira.toNumber() : null,
      })),
  };
}

export type PublicBusiness = ReturnType<typeof toPublicBusiness>;
