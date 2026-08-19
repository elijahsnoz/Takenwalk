import { NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { createJobFromPaystackTransaction } from "@/lib/jobs/createPaidJob";

/**
 * Paystack redirects the customer's browser here after checkout. This is
 * UX-only — never trust the query string alone, since it's fully
 * attacker-controlled. The real confirmation is verifyTransaction() calling
 * Paystack's own API for the true status, same as the webhook does
 * independently below.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference") ?? url.searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(new URL("/request/payment-failed", url.origin));
  }

  try {
    const transaction = await verifyTransaction(reference);
    if (!transaction.paid) {
      return NextResponse.redirect(new URL("/request/payment-failed", url.origin));
    }

    const { jobId } = await createJobFromPaystackTransaction(transaction);
    const successUrl = new URL("/request/success", url.origin);
    successUrl.searchParams.set("jobId", jobId);
    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("Paystack callback error", error);
    return NextResponse.redirect(new URL("/request/payment-failed", url.origin));
  }
}
