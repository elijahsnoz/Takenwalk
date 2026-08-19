import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Customer } from "@/generated/prisma/client";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const PIN_HASH_ROUNDS = 10;

export function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, PIN_HASH_ROUNDS);
}

/**
 * A 4-digit PIN is only 10,000 combinations — hashing alone isn't enough.
 * This is the one place PIN verification happens, so lockout can never be
 * bypassed by a caller forgetting to check it.
 */
export async function verifyAndTrackPinAttempt(
  customer: Customer,
  pin: string
): Promise<{ success: boolean; lockedOut: boolean }> {
  if (customer.pinLockedUntil && customer.pinLockedUntil > new Date()) {
    return { success: false, lockedOut: true };
  }

  if (!customer.pinHash) {
    return { success: false, lockedOut: false };
  }

  const matches = await bcrypt.compare(pin, customer.pinHash);

  if (matches) {
    if (customer.failedPinAttempts > 0 || customer.pinLockedUntil) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { failedPinAttempts: 0, pinLockedUntil: null },
      });
    }
    return { success: true, lockedOut: false };
  }

  const nextAttempts = customer.failedPinAttempts + 1;
  const triggersLockout = nextAttempts >= MAX_FAILED_ATTEMPTS;

  await prisma.customer.update({
    where: { id: customer.id },
    data: {
      failedPinAttempts: triggersLockout ? 0 : nextAttempts,
      pinLockedUntil: triggersLockout ? new Date(Date.now() + LOCKOUT_DURATION_MS) : customer.pinLockedUntil,
    },
  });

  return { success: false, lockedOut: triggersLockout };
}
