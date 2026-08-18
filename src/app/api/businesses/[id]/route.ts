import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const updateBusinessSchema = z.object({
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
  isPubliclyListed: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: RouteContext<"/api/businesses/[id]">) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = updateBusinessSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: z.prettifyError(parsed.error) }, { status: 400 });
  }

  const business = await prisma.business.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ data: { id: business.id } });
}
