import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { JOB_STATUS_META } from "@/lib/constants";
import { AssignWalkerForm } from "./components/AssignWalkerForm";
import { JobStatusTimeline } from "./components/JobStatusTimeline";
import { UpdateStatusForm } from "./components/UpdateStatusForm";

export const dynamic = "force-dynamic";

export default async function AdminJobDetailPage({ params }: PageProps<"/admin/piwoyi/jobs/[id]">) {
  const { id } = await params;

  const [job, walkers] = await Promise.all([
    prisma.job.findUnique({
      where: { id },
      include: {
        business: true,
        customer: true,
        assignedWalker: true,
        items: true,
        statusEvents: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.walker.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!job) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">{job.description}</h1>
          <p className="text-sm text-ink-soft">
            Job #{job.sequenceNumber} · from {job.business.name}
          </p>
        </div>
        <Badge tone={JOB_STATUS_META[job.status].tone}>{JOB_STATUS_META[job.status].label}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Customer</h2>
          <p className="mt-2 text-sm text-ink">{job.customer.name} · {job.customer.phone}</p>
          {job.destinationAddressText ? (
            <p className="mt-1 text-sm text-ink-soft">Destination: {job.destinationAddressText}</p>
          ) : null}
          {job.instructions ? <p className="mt-1 text-sm text-ink-soft">Instructions: {job.instructions}</p> : null}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Walker</h2>
          {job.assignedWalker ? (
            <p className="mt-2 text-sm text-ink">{job.assignedWalker.name} · {job.assignedWalker.phone}</p>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">Not assigned yet.</p>
          )}
          <div className="mt-3">
            <AssignWalkerForm jobId={job.id} walkers={walkers} />
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Update Status</h2>
        <div className="mt-3">
          <UpdateStatusForm jobId={job.id} currentStatus={job.status} />
        </div>
      </Card>

      <JobStatusTimeline events={job.statusEvents} />
    </div>
  );
}
