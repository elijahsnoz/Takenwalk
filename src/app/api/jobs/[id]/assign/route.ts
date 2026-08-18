import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assignWalkerSchema } from "@/lib/validation/job";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: RouteContext<"/api/jobs/[id]/assign">) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = assignWalkerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "walkerId is required" }, { status: 400 });
  }

  const [job, walker] = await Promise.all([
    prisma.job.findUnique({ where: { id } }),
    prisma.walker.findUnique({ where: { id: parsed.data.walkerId } }),
  ]);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (!walker) return NextResponse.json({ error: "Walker not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.job.update({
      where: { id },
      data: { assignedWalkerId: walker.id, status: "ASSIGNED" },
    }),
    prisma.jobStatusEvent.create({
      data: {
        jobId: id,
        fromStatus: job.status,
        toStatus: "ASSIGNED",
        actorType: "ADMIN",
        actorAdminId: session.user.id,
        note: `Assigned to ${walker.name}`,
      },
    }),
  ]);

  return NextResponse.json({ data: { id } });
}
