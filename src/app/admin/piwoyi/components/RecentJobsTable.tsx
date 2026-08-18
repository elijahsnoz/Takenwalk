import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { JOB_STATUS_META } from "@/lib/constants";
import type { JobStatus } from "@/generated/prisma/enums";

type RecentJob = {
  id: string;
  description: string;
  status: JobStatus;
  createdAt: Date;
  business: { name: string };
};

export function RecentJobsTable({ jobs }: { jobs: RecentJob[] }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Recent Jobs</h2>
        <Link href="/admin/piwoyi/jobs" className="text-xs font-semibold text-green hover:underline">
          View All
        </Link>
      </div>

      {jobs.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">No jobs yet — the first business is about to go live.</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink/10">
          {jobs.map((job) => {
            const meta = JOB_STATUS_META[job.status];
            return (
              <li key={job.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{job.description}</p>
                  <p className="text-xs text-ink-soft">from {job.business.name}</p>
                </div>
                <Badge tone={meta.tone}>{meta.label}</Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
