import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { VerifyTransactionResult } from "@/lib/paystack";

interface PaidJobMetadata {
  businessId: string;
  businessProductId: string;
  customerName: string;
  customerPhone: string;
  quantity?: string;
  destinationAddressText?: string;
  instructions?: string;
  preferredCommunicationChannel?: string;
}

function readMetadata(raw: Record<string, unknown> | null, reference: string): PaidJobMetadata {
  const businessId = raw?.businessId;
  const businessProductId = raw?.businessProductId;
  const customerName = raw?.customerName;
  const customerPhone = raw?.customerPhone;

  if (
    typeof businessId !== "string" ||
    typeof businessProductId !== "string" ||
    typeof customerName !== "string" ||
    typeof customerPhone !== "string"
  ) {
    throw new Error(`Paystack transaction ${reference} is missing required metadata`);
  }

  return {
    businessId,
    businessProductId,
    customerName,
    customerPhone,
    quantity: typeof raw?.quantity === "string" ? raw.quantity : undefined,
    destinationAddressText: typeof raw?.destinationAddressText === "string" ? raw.destinationAddressText : undefined,
    instructions: typeof raw?.instructions === "string" ? raw.instructions : undefined,
    preferredCommunicationChannel:
      typeof raw?.preferredCommunicationChannel === "string" ? raw.preferredCommunicationChannel : undefined,
  };
}

/**
 * Called from both the browser-redirect callback and the webhook — either
 * one might arrive first, or (rarely) both nearly at once. paystackReference
 * is the unique idempotency key: a second caller for the same reference gets
 * back the job the first caller already created, instead of a duplicate.
 */
export async function createJobFromPaystackTransaction(
  transaction: VerifyTransactionResult
): Promise<{ jobId: string; alreadyProcessed: boolean }> {
  if (!transaction.paid) {
    throw new Error(`createJobFromPaystackTransaction called with an unpaid transaction ${transaction.reference}`);
  }

  const existingPayment = await prisma.payment.findUnique({ where: { paystackReference: transaction.reference } });
  if (existingPayment) {
    return { jobId: existingPayment.jobId, alreadyProcessed: true };
  }

  const metadata = readMetadata(transaction.metadata, transaction.reference);

  const business = await prisma.business.findUnique({ where: { id: metadata.businessId } });
  if (!business) {
    throw new Error(`Paystack transaction ${transaction.reference} references missing business ${metadata.businessId}`);
  }

  const product = await prisma.businessProduct.findUnique({ where: { id: metadata.businessProductId } });
  if (!product) {
    throw new Error(
      `Paystack transaction ${transaction.reference} references missing product ${metadata.businessProductId}`
    );
  }

  try {
    const jobId = await prisma.$transaction(async (db) => {
      const customer = await db.customer.upsert({
        where: { phone: metadata.customerPhone },
        update: { name: metadata.customerName },
        create: {
          name: metadata.customerName,
          phone: metadata.customerPhone,
          neighborhoodId: business.neighborhoodId,
        },
      });

      const job = await db.job.create({
        data: {
          customerId: customer.id,
          businessId: business.id,
          neighborhoodId: business.neighborhoodId,
          description: product.name,
          destinationAddressText: metadata.destinationAddressText,
          instructions: metadata.instructions,
          preferredCommunicationChannel:
            (metadata.preferredCommunicationChannel as
              | "APP"
              | "WEB"
              | "WHATSAPP"
              | "SMS"
              | "PHONE"
              | "COORDINATOR"
              | undefined) ?? "WHATSAPP",
          status: "NEW",
          items: {
            create: [{ description: product.name, quantity: metadata.quantity, businessProductId: product.id }],
          },
        },
      });

      await db.jobStatusEvent.create({ data: { jobId: job.id, toStatus: "NEW", actorType: "CUSTOMER" } });

      await db.payment.create({
        data: {
          jobId: job.id,
          amountNaira: transaction.amountKobo / 100,
          method: "PAYSTACK",
          status: "COMPLETED",
          paystackReference: transaction.reference,
        },
      });

      return job.id;
    });

    return { jobId, alreadyProcessed: false };
  } catch (error) {
    // Callback and webhook can race for the same transaction — the loser
    // hits this unique-constraint violation, not a first-class "not found".
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const winner = await prisma.payment.findUnique({ where: { paystackReference: transaction.reference } });
      if (winner) return { jobId: winner.jobId, alreadyProcessed: true };
    }
    throw error;
  }
}
