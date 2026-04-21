-- CreateTable
CREATE TABLE "scae_schools" (
    "id" TEXT NOT NULL,
    "municipalityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inep_code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "scae_schools_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scae_schools_inep_code_key" ON "scae_schools"("inep_code");

-- CreateIndex
CREATE INDEX "scae_schools_municipalityId_idx" ON "scae_schools"("municipalityId");

-- CreateIndex
CREATE INDEX "scae_schools_inep_code_idx" ON "scae_schools"("inep_code");

-- AddForeignKey
ALTER TABLE "scae_schools" ADD CONSTRAINT "scae_schools_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "scae_municipalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
