import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasPaystack } from "@/lib/env";
import { initializeTransaction, syntheticCustomerEmail, PaystackError } from "@/lib/paystack";
import { initializePaymentSchema } from "@/lib/validation/payment";

export async function POST(request: Request) {
  if (!hasPaystack) {
    return NextResponse.json(
      { error: "Online payment isn't turned on yet — please use the regular request form." },
      { status: 503 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = initializePaymentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
  }

  const business = await prisma.business.findUnique({ where: { id: parsed.data.businessId } });
  if (!business || !business.isPubliclyListed) {
    return NextResponse.json({ error: "That business could not be found." }, { status: 404 });
  }

  const product = await prisma.businessProduct.findUnique({ where: { id: parsed.data.businessProductId } });
  if (!product || product.businessId !== business.id || !product.isAvailable || product.priceNaira == null) {
    return NextResponse.json({ error: "That product isn't available for online payment." }, { status: 404 });
  }

  const amountKobo = Math.round(product.priceNaira.toNumber() * 100);
  const origin = new URL(request.url).origin;

  try {
    const result = await initializeTransaction({
      amountKobo,
      email: syntheticCustomerEmail(parsed.data.customerPhone),
      reference: `tw_${randomUUID()}`,
      callbackUrl: `${origin}/api/payments/paystack/callback`,
      metadata: {
        businessId: business.id,
        businessProductId: product.id,
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        quantity: parsed.data.quantity,
        destinationAddressText: parsed.data.destinationAddressText,
        instructions: parsed.data.instructions,
        preferredCommunicationChannel: parsed.data.preferredCommunicationChannel,
      },
    });

    return NextResponse.json({ data: { authorizationUrl: result.authorizationUrl } });
  } catch (error) {
    if (error instanceof PaystackError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }
    throw error;
  }
}
