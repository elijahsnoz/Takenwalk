import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobStatusUpdateSchema } from "@/lib/validation/job";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: RouteContext<"/api/jobs/[id]/status">) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => null);
  const parsed = jobStatusUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.job.update({
      where: { id },
      data: {
        status: parsed.data.toStatus,
        completedAt: parsed.data.toStatus === "COMPLETED" ? new Date() : job.completedAt,
      },
    }),
    prisma.jobStatusEvent.create({
      data: {
        jobId: id,
        fromStatus: job.status,
        toStatus: parsed.data.toStatus,
        actorType: "ADMIN",
        actorAdminId: session.user.id,
        note: parsed.data.note,
      },
    }),
  ]);

  return NextResponse.json({ data: { id } });
}
