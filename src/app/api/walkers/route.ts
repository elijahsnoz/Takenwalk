import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Public surface for the map's Walkers layer: a count only. Precise Walker
 * location is private except when relevant to an active job they're on — see
 * spec §13/§25 — so no pins, coordinates, or identities are ever returned here.
 */
export async function GET() {
  const availableCount = await prisma.walker.count({ where: { status: "AVAILABLE", isActive: true } });
  return NextResponse.json({ data: { availableCount } });
}

const createWalkerSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(7).max(20),
  whatsapp: z.string().max(20).optional(),
  communicationChannel: z.enum(["APP", "WEB", "WHATSAPP", "SMS", "PHONE", "COORDINATOR"]).default("PHONE"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = createWalkerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
  }

  const neighborhood = await prisma.neighborhood.findUnique({ where: { slug: "piwoyi" } });
  const walker = await prisma.walker.create({
    data: { ...parsed.data, neighborhoodId: neighborhood?.id },
  });

  return NextResponse.json({ data: { id: walker.id } }, { status: 201 });
}
