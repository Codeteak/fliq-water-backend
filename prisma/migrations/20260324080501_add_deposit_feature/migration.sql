-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "depositBase" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "depositCharge" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "depositDiscount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "depositRefundedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DepositConfig" (
    "id" TEXT NOT NULL,
    "perCanAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "promoActive" BOOLEAN NOT NULL DEFAULT false,
    "promoStartsAt" TIMESTAMP(3),
    "promoEndsAt" TIMESTAMP(3),
    "tiers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepositConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDepositWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDepositWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepositTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDepositWallet_userId_key" ON "UserDepositWallet"("userId");

-- CreateIndex
CREATE INDEX "DepositTransaction_userId_createdAt_idx" ON "DepositTransaction"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserDepositWallet" ADD CONSTRAINT "UserDepositWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositTransaction" ADD CONSTRAINT "DepositTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositTransaction" ADD CONSTRAINT "DepositTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
