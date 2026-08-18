import { z } from "zod";

const categoryKeySchema = z.enum([
  "GENERAL_SHOP",
  "FOODSTUFF",
  "POS",
  "FOOD_VENDOR",
  "PHARMACY_HEALTH",
  "FASHION",
  "PHONE_TECH",
  "REPAIR_SERVICE",
  "HOUSEHOLD",
  "OTHER",
]);

/** The public "Add Your Business" lead form — no location yet, that's captured later by the founder in the field. */
export const publicBusinessLeadSchema = z.object({
  name: z.string().min(2).max(120),
  categoryKey: categoryKeySchema,
  ownerName: z.string().max(120).optional(),
  phone: z.string().min(7).max(20),
  whatsapp: z.string().max(20).optional(),
  address: z.string().max(300).optional(),
  description: z.string().max(1000).optional(),
});

export type PublicBusinessLeadInput = z.infer<typeof publicBusinessLeadSchema>;

/** The admin field-mapping form (and its offline-sync replay) — the full capture. */
export const adminBusinessSchema = z.object({
  clientRecordId: z.string().min(1),
  name: z.string().min(2).max(120),
  categoryKey: categoryKeySchema,
  ownerName: z.string().max(120).optional(),
  phone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  address: z.string().max(300).optional(),
  description: z.string().max(2000).optional(),
  productsServices: z.string().max(2000).optional(),
  topRequestedProducts: z.array(z.string().max(80)).max(5).default([]),
  openingHours: z
    .array(
      z.object({
        day: z.number().min(0).max(6),
        opens: z.string(),
        closes: z.string(),
        closed: z.boolean(),
      })
    )
    .length(7)
    .optional(),
  paymentMethods: z.array(z.enum(["CASH", "POS_CARD", "BANK_TRANSFER", "MOBILE_MONEY"])).default([]),
  pickupAvailable: z.boolean().default(false),
  whatsappOrderingAvailable: z.boolean().default(false),
  showPhonePublicly: z.boolean().default(false),
  showWhatsappPublicly: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().min(0).optional(),
  locationSource: z.enum(["GPS", "MANUAL", "VERIFIED"]),
  dateVisited: z.coerce.date().optional(),
});

export type AdminBusinessInput = z.infer<typeof adminBusinessSchema>;
