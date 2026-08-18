import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { JOB_STATUS_META } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const jobs = await prisma.job.findMany({
    where: { isDemoData: false },
    include: { business: true, assignedWalker: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">Jobs</h1>
        <p className="text-sm text-ink-soft">{jobs.length} jobs total.</p>
      </div>

      {jobs.length === 0 ? (
        <Card className="p-8 text-center text-sm text-ink-soft">
          No jobs yet — the first business is about to go live.
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {jobs.map((job) => (
            <Link key={job.id} href={`/admin/piwoyi/jobs/${job.id}`}>
              <Card className="flex items-center justify-between p-4 hover:bg-cream-soft">
                <div>
                  <p className="font-medium text-ink">{job.description}</p>
                  <p className="text-sm text-ink-soft">
                    from {job.business.name}
                    {job.assignedWalker ? ` · ${job.assignedWalker.name}` : ""}
                  </p>
                </div>
                <Badge tone={JOB_STATUS_META[job.status].tone}>{JOB_STATUS_META[job.status].label}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
