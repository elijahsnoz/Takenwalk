import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { toPublicJobPin } from "@/lib/dto/job";
import { isDemoModeEnabled } from "@/lib/env";
import { jobRequestSchema } from "@/lib/validation/job";

export const dynamic = "force-dynamic";

/** Public "Active Jobs" map layer — pins sit at the business location, never the customer's. */
export async function GET() {
  const jobs = await prisma.job.findMany({
    where: {
      status: { notIn: ["COMPLETED", "CANCELLED"] },
      isDemoData: isDemoModeEnabled ? undefined : false,
    },
    select: { id: true, status: true, business: { select: { latitude: true, longitude: true } } },
  });

  const pins = jobs.filter((j) => j.business.latitude != null && j.business.longitude != null);
  return NextResponse.json({ data: pins.map(toPublicJobPin) });
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = jobRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
  }

  const business = await prisma.business.findUnique({ where: { id: parsed.data.businessId } });
  if (!business || !business.isPubliclyListed) {
    return NextResponse.json({ error: "That business could not be found." }, { status: 404 });
  }

  const customer = await prisma.customer.upsert({
    where: { phone: parsed.data.customerPhone },
    update: { name: parsed.data.customerName },
    create: {
      name: parsed.data.customerName,
      phone: parsed.data.customerPhone,
      neighborhoodId: business.neighborhoodId,
    },
  });

  const job = await prisma.job.create({
    data: {
      customerId: customer.id,
      businessId: business.id,
      neighborhoodId: business.neighborhoodId,
      description: parsed.data.description,
      destinationAddressText: parsed.data.destinationAddressText,
      destinationLatitude: parsed.data.destinationLatitude,
      destinationLongitude: parsed.data.destinationLongitude,
      instructions: parsed.data.instructions,
      preferredCommunicationChannel: parsed.data.preferredCommunicationChannel,
      status: "NEW",
      ...(parsed.data.quantity
        ? { items: { create: [{ description: parsed.data.description, quantity: parsed.data.quantity }] } }
        : {}),
    },
  });

  await prisma.jobStatusEvent.create({
    data: { jobId: job.id, toStatus: "NEW", actorType: "CUSTOMER" },
  });

  return NextResponse.json({ data: { id: job.id } }, { status: 201 });
}
