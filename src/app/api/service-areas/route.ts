import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toPublicServiceArea } from "@/lib/dto/serviceArea";

export const dynamic = "force-dynamic";

export async function GET() {
  const serviceAreas = await prisma.serviceArea.findMany({ where: { isActive: true } });
  return NextResponse.json({ data: serviceAreas.map(toPublicServiceArea) });
}
