import crypto from "node:crypto";
import { env } from "@/lib/env";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

export class PaystackError extends Error {}

function requireSecretKey(): string {
  if (!env.PAYSTACK_SECRET_KEY) {
    throw new PaystackError("Paystack is not configured — PAYSTACK_SECRET_KEY is unset.");
  }
  return env.PAYSTACK_SECRET_KEY;
}

/** Paystack requires an email even though TakenWalk customers only ever give a phone number. */
export function syntheticCustomerEmail(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "") || "customer";
  return `${digits}@guest.takenwalk.app`;
}

interface InitializeTransactionParams {
  amountKobo: number;
  email: string;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}

interface InitializeTransactionResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<InitializeTransactionResult> {
  const secretKey = requireSecretKey();

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      currency: "NGN",
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.status) {
    throw new PaystackError(body?.message ?? `Paystack initialize failed (HTTP ${response.status})`);
  }

  return {
    authorizationUrl: body.data.authorization_url,
    accessCode: body.data.access_code,
    reference: body.data.reference,
  };
}

export interface VerifyTransactionResult {
  paid: boolean;
  reference: string;
  amountKobo: number;
  currency: string;
  paidAt: string | null;
  channel: string | null;
  metadata: Record<string, unknown> | null;
}

export async function verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
  const secretKey = requireSecretKey();

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.status) {
    throw new PaystackError(body?.message ?? `Paystack verify failed (HTTP ${response.status})`);
  }

  const data = body.data;
  return {
    paid: data.status === "success",
    reference: data.reference,
    amountKobo: data.amount,
    currency: data.currency,
    paidAt: data.paid_at ?? null,
    channel: data.channel ?? null,
    metadata: data.metadata ?? null,
  };
}

/**
 * HMAC-SHA512 of the raw (unparsed) request body, per Paystack's webhook spec.
 * Must run on the exact bytes Paystack sent — re-serializing parsed JSON can
 * reorder keys/whitespace and silently break verification.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader || !env.PAYSTACK_SECRET_KEY) return false;

  const expected = crypto.createHmac("sha512", env.PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signatureHeader, "hex");

  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}
