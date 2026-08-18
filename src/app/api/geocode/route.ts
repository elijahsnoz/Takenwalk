import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { reverseGeocodeQuerySchema } from "@/lib/validation/geocode";
import { reverseGeocode } from "@/lib/geocoding";

export const dynamic = "force-dynamic";

/**
 * Reverse geocoding is display-only/best-effort: lat/lng stays the
 * authoritative location no matter what (or whether) this returns.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = reverseGeocodeQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const result = await reverseGeocode(parsed.data.latitude, parsed.data.longitude).catch(() => null);
  return NextResponse.json({ data: { address: result?.displayName ?? null } });
}
