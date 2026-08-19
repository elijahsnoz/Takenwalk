-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'PAYSTACK';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "paystackReference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "payments_paystackReference_key" ON "payments"("paystackReference");

