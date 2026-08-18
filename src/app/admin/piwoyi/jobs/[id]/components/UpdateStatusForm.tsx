"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { JOB_STATUS_ORDER, JOB_STATUS_META } from "@/lib/constants";
import type { JobStatus } from "@/generated/prisma/enums";

export function UpdateStatusForm({ jobId, currentStatus }: { jobId: string; currentStatus: JobStatus }) {
  const [status, setStatus] = useState<JobStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpdate() {
    if (status === currentStatus) return;
    setLoading(true);
    await fetch(`/api/jobs/${jobId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toStatus: status }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select value={status} onChange={(e) => setStatus(e.target.value as JobStatus)}>
        {[...JOB_STATUS_ORDER, "CANCELLED" as const].map((s) => (
          <option key={s} value={s}>
            {JOB_STATUS_META[s].label}
          </option>
        ))}
      </Select>
      <Button size="md" variant="outline" onClick={handleUpdate} disabled={status === currentStatus || loading}>
        {loading ? "Updating…" : "Update Status"}
      </Button>
    </div>
  );
}
