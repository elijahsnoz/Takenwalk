"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function BusinessAdminActions({
  businessId,
  verificationStatus,
  isPubliclyListed,
}: {
  businessId: string;
  verificationStatus: string;
  isPubliclyListed: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function patch(body: Record<string, unknown>) {
    setLoading(true);
    await fetch(`/api/businesses/${businessId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {verificationStatus !== "VERIFIED" ? (
        <Button size="md" disabled={loading} onClick={() => patch({ verificationStatus: "VERIFIED" })}>
          Mark Verified
        </Button>
      ) : null}
      <Button
        size="md"
        variant="outline"
        disabled={loading}
        onClick={() => patch({ isPubliclyListed: !isPubliclyListed })}
      >
        {isPubliclyListed ? "Hide from public map" : "List on public map"}
      </Button>
    </div>
  );
}
