import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { JOB_STATUS_META } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminWalkerDetailPage({ params }: PageProps<"/admin/piwoyi/walkers/[id]">) {
  const { id } = await params;

  const walker = await prisma.walker.findUnique({
    where: { id },
    include: { jobs: { include: { business: true }, orderBy: { createdAt: "desc" }, take: 20 } },
  });

  if (!walker) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">{walker.name}</h1>
        <p className="text-sm text-ink-soft">
          {walker.phone} · {walker.communicationChannel} · <Badge tone="neutral">{walker.status}</Badge>
        </p>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Jobs</h2>
        {walker.jobs.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">No jobs assigned yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink/10">
            {walker.jobs.map((job) => (
              <li key={job.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink">{job.description} — {job.business.name}</span>
                <Badge tone={JOB_STATUS_META[job.status].tone}>{JOB_STATUS_META[job.status].label}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
