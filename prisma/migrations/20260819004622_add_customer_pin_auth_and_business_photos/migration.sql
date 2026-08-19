-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "additionalPhotoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "dpPhotoUrl" TEXT,
ADD COLUMN     "failedPinAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pinHash" TEXT,
ADD COLUMN     "pinLockedUntil" TIMESTAMP(3);
