-- CreateTable
CREATE TABLE "scae_municipalities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" CHAR(2) NOT NULL,
    "ibge_code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "scae_municipalities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scae_municipalities_ibge_code_key" ON "scae_municipalities"("ibge_code");

-- CreateIndex
CREATE INDEX "scae_municipalities_state_idx" ON "scae_municipalities"("state");

-- CreateIndex
CREATE INDEX "scae_municipalities_ibge_code_idx" ON "scae_municipalities"("ibge_code");
