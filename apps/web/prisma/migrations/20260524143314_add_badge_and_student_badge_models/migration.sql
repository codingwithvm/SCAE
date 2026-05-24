-- CreateTable
CREATE TABLE "scae_badges" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "color" VARCHAR(100) NOT NULL,
    "criteria" JSONB,

    CONSTRAINT "scae_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scae_student_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "context" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scae_student_badges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scae_student_badges_userId_idx" ON "scae_student_badges"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "scae_student_badges_userId_badgeId_context_key" ON "scae_student_badges"("userId", "badgeId", "context");

-- AddForeignKey
ALTER TABLE "scae_student_badges" ADD CONSTRAINT "scae_student_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "scae_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_student_badges" ADD CONSTRAINT "scae_student_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "scae_badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
