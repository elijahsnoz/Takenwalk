import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { customerRegisterSchema } from "@/lib/validation/customer";
import { hashPin } from "@/lib/pinAuth";
import { uploadPhoto } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * Reuses the existing Customer row if this phone already placed a guest job
 * request before — "registering" just adds a PIN/DP to it rather than
 * creating a duplicate record.
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = customerRegisterSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    pin: formData.get("pin"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
  }

  const existing = await prisma.customer.findUnique({ where: { phone: parsed.data.phone } });
  if (existing?.pinHash) {
    return NextResponse.json(
      { error: "An account with this phone number already exists — try signing in instead." },
      { status: 409 }
    );
  }

  let dpPhotoUrl: string | undefined;
  const photo = formData.get("dp");
  if (photo instanceof File && photo.size > 0) {
    const uploaded = await uploadPhoto(photo, "customer-dp");
    dpPhotoUrl = uploaded.url;
  }

  const pinHash = await hashPin(parsed.data.pin);

  const customer = existing
    ? await prisma.customer.update({
        where: { id: existing.id },
        data: { name: parsed.data.name, pinHash, dpPhotoUrl },
      })
    : await prisma.customer.create({
        data: { name: parsed.data.name, phone: parsed.data.phone, pinHash, dpPhotoUrl },
      });

  return NextResponse.json({ data: { id: customer.id } }, { status: 201 });
}
