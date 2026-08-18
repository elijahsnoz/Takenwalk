import type { Walker } from "@/generated/prisma/client";

/**
 * Never include phone/whatsapp/exact coordinates here — this is the shape
 * that would back a future public "Walkers nearby" layer. Nothing in Phase 1
 * renders this publicly yet, but the boundary exists now so a careless
 * future query can't leak a Walker's identity or location.
 */
export function toPublicWalkerSummary(walker: Pick<Walker, "id" | "name" | "status">) {
  return {
    id: walker.id,
    firstName: walker.name.split(" ")[0],
    status: walker.status,
  };
}

export type PublicWalkerSummary = ReturnType<typeof toPublicWalkerSummary>;
