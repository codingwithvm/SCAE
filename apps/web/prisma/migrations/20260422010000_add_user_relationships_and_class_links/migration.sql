-- AlterTable
ALTER TABLE "scae_users"
ADD COLUMN "schoolId" TEXT,
ADD COLUMN "municipalityId" TEXT;

-- CreateTable
CREATE TABLE "scae_teacher_classes" (
    "teacherId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "scae_teacher_classes_pkey" PRIMARY KEY ("teacherId","classId")
);

-- CreateTable
CREATE TABLE "scae_student_classes" (
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scae_student_classes_pkey" PRIMARY KEY ("studentId","classId")
);

-- CreateIndex
CREATE INDEX "scae_users_schoolId_idx" ON "scae_users"("schoolId");

-- CreateIndex
CREATE INDEX "scae_users_municipalityId_idx" ON "scae_users"("municipalityId");

-- CreateIndex
CREATE INDEX "scae_teacher_classes_classId_idx" ON "scae_teacher_classes"("classId");

-- CreateIndex
CREATE INDEX "scae_student_classes_classId_idx" ON "scae_student_classes"("classId");

-- AddForeignKey
ALTER TABLE "scae_users" ADD CONSTRAINT "scae_users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "scae_schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_users" ADD CONSTRAINT "scae_users_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "scae_municipalities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_teacher_classes" ADD CONSTRAINT "scae_teacher_classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "scae_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_teacher_classes" ADD CONSTRAINT "scae_teacher_classes_classId_fkey" FOREIGN KEY ("classId") REFERENCES "scae_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_student_classes" ADD CONSTRAINT "scae_student_classes_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "scae_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_student_classes" ADD CONSTRAINT "scae_student_classes_classId_fkey" FOREIGN KEY ("classId") REFERENCES "scae_classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
