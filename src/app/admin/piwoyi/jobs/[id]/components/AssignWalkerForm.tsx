"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select, Label } from "@/components/ui/Field";

export function AssignWalkerForm({
  jobId,
  walkers,
}: {
  jobId: string;
  walkers: { id: string; name: string; status: string }[];
}) {
  const [walkerId, setWalkerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleAssign() {
    if (!walkerId) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/jobs/${jobId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walkerId }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Could not assign Walker.");
      return;
    }
    router.refresh();
  }

  if (walkers.length === 0) {
    return <p className="text-sm text-ink-soft">No Walkers yet — add one from the Walkers page first.</p>;
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Label htmlFor="walkerId">
        Assign Walker
        <Select id="walkerId" value={walkerId} onChange={(e) => setWalkerId(e.target.value)}>
          <option value="">Choose a Walker</option>
          {walkers.map((walker) => (
            <option key={walker.id} value={walker.id}>
              {walker.name} ({walker.status})
            </option>
          ))}
        </Select>
      </Label>
      <Button onClick={handleAssign} disabled={!walkerId || loading}>
        {loading ? "Assigning…" : "Assign"}
      </Button>
      {error ? <p className="text-sm text-red">{error}</p> : null}
    </div>
  );
}
