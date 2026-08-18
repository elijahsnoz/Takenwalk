import type { Business, Job } from "@/generated/prisma/client";

/**
 * Public "Active Jobs" map layer: pins at the BUSINESS location only. Never
 * the customer's destination — that stays private to the job's own
 * participants (see spec §5/§25).
 */
export function toPublicJobPin(job: Pick<Job, "id" | "status"> & { business: Pick<Business, "latitude" | "longitude"> }) {
  return {
    id: job.id,
    status: job.status,
    latitude: job.business.latitude,
    longitude: job.business.longitude,
  };
}

export type PublicJobPin = ReturnType<typeof toPublicJobPin>;
