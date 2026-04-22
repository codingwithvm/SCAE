-- CreateTable
CREATE TABLE "scae_classes" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "scae_classes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scae_classes_schoolId_idx" ON "scae_classes"("schoolId");

-- CreateIndex
CREATE INDEX "scae_classes_year_idx" ON "scae_classes"("year");

-- AddForeignKey
ALTER TABLE "scae_classes" ADD CONSTRAINT "scae_classes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "scae_schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
