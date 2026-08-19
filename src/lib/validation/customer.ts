import { z } from "zod";

const pinSchema = z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits");

export const customerRegisterSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(7).max(20),
  pin: pinSchema,
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;

export const customerLoginSchema = z.object({
  phone: z.string().min(7).max(20),
  pin: pinSchema,
});
