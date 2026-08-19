import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required — generate one with `openssl rand -base64 32`"),
  ADMIN_EMAIL: z.email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  NEXT_PUBLIC_MAP_STYLE_URL: z.string().optional(),
  NOMINATIM_BASE_URL: z.string().optional(),
  GEOCODING_USER_AGENT: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  DEMO_MODE: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(z.prettifyError(parsed.error));
  throw new Error("Invalid environment variables — check .env against .env.example");
}

export const env = parsed.data;

/** DEMO_MODE must be explicitly "true" — absence or any other value means real-data mode. */
export const isDemoModeEnabled = env.DEMO_MODE === "true";

export const hasBlobStorage = Boolean(env.BLOB_READ_WRITE_TOKEN);

export const hasPaystack = Boolean(env.PAYSTACK_SECRET_KEY);
