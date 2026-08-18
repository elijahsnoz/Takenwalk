import { z } from "zod";

export const jobRequestSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(7).max(20),
  businessId: z.string().min(1),
  description: z.string().min(3).max(1000),
  quantity: z.string().max(100).optional(),
  destinationAddressText: z.string().max(300).optional(),
  destinationLatitude: z.number().min(-90).max(90).optional(),
  destinationLongitude: z.number().min(-180).max(180).optional(),
  instructions: z.string().max(1000).optional(),
  preferredCommunicationChannel: z
    .enum(["APP", "WEB", "WHATSAPP", "SMS", "PHONE", "COORDINATOR"])
    .default("WHATSAPP"),
});

export type JobRequestInput = z.infer<typeof jobRequestSchema>;

export const assignWalkerSchema = z.object({
  walkerId: z.string().min(1),
});

export const jobStatusUpdateSchema = z.object({
  toStatus: z.enum([
    "NEW",
    "ASSIGNED",
    "ACCEPTED",
    "GOING_TO_SHOP",
    "SHOPPING",
    "PURCHASE_CONFIRMED",
    "PICKED_UP",
    "DELIVERING",
    "COMPLETED",
    "CANCELLED",
  ]),
  note: z.string().max(500).optional(),
});
