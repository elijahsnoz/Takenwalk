import { z } from "zod";

export const initializePaymentSchema = z.object({
  businessId: z.string().min(1),
  businessProductId: z.string().min(1),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(7).max(20),
  quantity: z.string().max(100).optional(),
  destinationAddressText: z.string().max(300).optional(),
  instructions: z.string().max(1000).optional(),
  preferredCommunicationChannel: z
    .enum(["APP", "WEB", "WHATSAPP", "SMS", "PHONE", "COORDINATOR"])
    .default("WHATSAPP"),
});
