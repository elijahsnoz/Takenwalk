import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { geocodeAddress } from "@/lib/geocoding";

export const dynamic = "force-dynamic";

const forwardGeocodeQuerySchema = z.object({ address: z.string().min(3).max(300) });

/**
 * Address -> coordinates, used only when an admin types an address in the
 * field-mapping form. The result is a starting pin the admin can still drag
 * to correct — lat/lng saved to the business is never re-derived from the
 * address after that, so this never runs on public map load.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = forwardGeocodeQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide an address (min 3 characters)" }, { status: 400 });
  }

  const result = await geocodeAddress(parsed.data.address).catch(() => null);
  if (!result) {
    return NextResponse.json({ data: null, error: "Could not find that address" }, { status: 200 });
  }

  return NextResponse.json({ data: result });
}
