import { Card } from "@/components/ui/Card";
import { JOB_STATUS_META } from "@/lib/constants";
import type { JobStatus } from "@/generated/prisma/enums";

type StatusEvent = {
  id: string;
  toStatus: JobStatus;
  note: string | null;
  createdAt: Date;
  actorType: string;
};

export function JobStatusTimeline({ events }: { events: StatusEvent[] }) {
  return (
    <Card className="p-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Status History</h2>
      {events.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">No status changes yet.</p>
      ) : (
        <ol className="mt-3 space-y-3 border-l-2 border-ink/10 pl-4">
          {events.map((event) => (
            <li key={event.id}>
              <p className="text-sm font-semibold text-ink">{JOB_STATUS_META[event.toStatus].label}</p>
              <p className="text-xs text-ink-soft">
                {event.createdAt.toLocaleString()} · {event.actorType}
                {event.note ? ` — ${event.note}` : ""}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
