import { NextResponse } from "next/server";
import { verifyWebhookSignature, verifyTransaction } from "@/lib/paystack";
import { createJobFromPaystackTransaction } from "@/lib/jobs/createPaidJob";

/**
 * The authoritative confirmation path — fires even if the customer closes
 * their browser before the callback redirect completes. Must read the raw
 * body (not request.json()) because signature verification needs the exact
 * bytes Paystack signed.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success" && typeof event.data?.reference === "string") {
    try {
      // Re-verify against Paystack's API rather than trusting the webhook
      // body's own status field — the signature proves the request came
      // from Paystack, not that this specific payload is the final truth.
      const transaction = await verifyTransaction(event.data.reference);
      if (transaction.paid) {
        await createJobFromPaystackTransaction(transaction);
      }
    } catch (error) {
      console.error("Paystack webhook processing error", error);
      // Return 200 anyway: a data/metadata problem won't be fixed by
      // Paystack's retry, and the callback redirect covers the common case
      // where the customer's browser makes it back on its own.
    }
  }

  return NextResponse.json({ received: true });
}
