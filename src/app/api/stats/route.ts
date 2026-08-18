import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPiwoyiStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: await getPiwoyiStats() });
}
