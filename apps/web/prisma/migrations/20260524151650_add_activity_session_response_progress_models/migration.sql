-- CreateTable
CREATE TABLE "scae_activities" (
    "id" TEXT NOT NULL,
    "habilidadeCode" VARCHAR(20) NOT NULL,
    "habilidadeDesc" TEXT NOT NULL,
    "discipline" VARCHAR(5) NOT NULL,
    "grade" VARCHAR(5) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "activityVersion" VARCHAR(10) NOT NULL DEFAULT 'v4',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "level1Content" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scae_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scae_activity_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'started',
    "scaeLevel" VARCHAR(20),
    "spaeceLevel" VARCHAR(30),
    "level1Score" DOUBLE PRECISION,
    "level2Score" DOUBLE PRECISION,
    "level3Score" DOUBLE PRECISION,
    "totalScore" DOUBLE PRECISION,
    "confidenceIndex" DOUBLE PRECISION,
    "timeSpentSecs" INTEGER,
    "reflectionData" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scae_activity_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scae_activity_responses" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" VARCHAR(50) NOT NULL,
    "questionText" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "selectedOption" VARCHAR(5) NOT NULL,
    "correctOption" VARCHAR(5) NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "points" INTEGER NOT NULL,
    "spaeceDescriptor" VARCHAR(20),
    "responseTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scae_activity_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scae_student_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "habilidadeCode" VARCHAR(20) NOT NULL,
    "discipline" VARCHAR(5) NOT NULL,
    "grade" INTEGER NOT NULL,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "completionsCount" INTEGER NOT NULL DEFAULT 0,
    "bestScaeLevel" VARCHAR(20),
    "currentScaeLevel" VARCHAR(20),
    "bestScore" DOUBLE PRECISION,
    "averageScore" DOUBLE PRECISION,
    "needsAttention" BOOLEAN NOT NULL DEFAULT false,
    "evolutionData" TEXT,
    "firstAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scae_student_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scae_activities_habilidadeCode_idx" ON "scae_activities"("habilidadeCode");

-- CreateIndex
CREATE INDEX "scae_activities_discipline_idx" ON "scae_activities"("discipline");

-- CreateIndex
CREATE INDEX "scae_activities_grade_idx" ON "scae_activities"("grade");

-- CreateIndex
CREATE INDEX "scae_activities_isActive_idx" ON "scae_activities"("isActive");

-- CreateIndex
CREATE INDEX "scae_activity_sessions_userId_idx" ON "scae_activity_sessions"("userId");

-- CreateIndex
CREATE INDEX "scae_activity_sessions_activityId_idx" ON "scae_activity_sessions"("activityId");

-- CreateIndex
CREATE INDEX "scae_activity_sessions_status_idx" ON "scae_activity_sessions"("status");

-- CreateIndex
CREATE INDEX "scae_activity_responses_sessionId_idx" ON "scae_activity_responses"("sessionId");

-- CreateIndex
CREATE INDEX "scae_student_progress_userId_idx" ON "scae_student_progress"("userId");

-- CreateIndex
CREATE INDEX "scae_student_progress_habilidadeCode_idx" ON "scae_student_progress"("habilidadeCode");

-- CreateIndex
CREATE INDEX "scae_student_progress_needsAttention_idx" ON "scae_student_progress"("needsAttention");

-- CreateIndex
CREATE UNIQUE INDEX "scae_student_progress_userId_habilidadeCode_key" ON "scae_student_progress"("userId", "habilidadeCode");

-- AddForeignKey
ALTER TABLE "scae_activities" ADD CONSTRAINT "scae_activities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "scae_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_activity_sessions" ADD CONSTRAINT "scae_activity_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "scae_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_activity_sessions" ADD CONSTRAINT "scae_activity_sessions_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "scae_activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_activity_responses" ADD CONSTRAINT "scae_activity_responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "scae_activity_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_student_progress" ADD CONSTRAINT "scae_student_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "scae_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_student_progress" ADD CONSTRAINT "scae_student_progress_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "scae_activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
