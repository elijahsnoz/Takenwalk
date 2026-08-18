import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Public surface for the map's Customers layer: a total count only, never
 * individual locations (those are always private — see spec §5/§25). A
 * neighborhood-level demand heatmap with a k-anonymity floor is a natural
 * Phase 2 upgrade (spec §21); Phase 1 keeps this deliberately simple.
 */
export async function GET() {
  const count = await prisma.customer.count();
  return NextResponse.json({ data: { count } });
}
