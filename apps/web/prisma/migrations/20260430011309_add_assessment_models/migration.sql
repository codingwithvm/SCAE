-- CreateEnum
CREATE TYPE "Instrument" AS ENUM ('MCEES_1A4', 'MCEES_5A9', 'MCEES_PROF', 'MEES_PROF');

-- CreateEnum
CREATE TYPE "ReleaseState" AS ENUM ('PENDING', 'IN_USE', 'CONSUMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AssessmentState" AS ENUM ('STARTED', 'IN_PROGRESS', 'COMPLETE', 'ABANDONED');

-- CreateEnum
CREATE TYPE "ConsistencyTier" AS ENUM ('CONFIRMED', 'PREDOMINANT', 'IN_MAPPING');

-- CreateTable
CREATE TABLE "scae_assessment_releases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instrument" "Instrument" NOT NULL,
    "released_by_id" TEXT NOT NULL,
    "classId" TEXT,
    "state" "ReleaseState" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3),
    "consumed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scae_assessment_releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scae_assessments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instrument" "Instrument" NOT NULL,
    "release_id" TEXT,
    "state" "AssessmentState" NOT NULL DEFAULT 'STARTED',
    "responses_json" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "total_time_seconds" INTEGER,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scae_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scae_assessment_results" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "quadrant" INTEGER,
    "axis_x" DECIMAL(8,4) NOT NULL,
    "axis_y" DECIMAL(8,4) NOT NULL,
    "conf_x" DECIMAL(5,2),
    "conf_y" DECIMAL(5,2),
    "tier" "ConsistencyTier" NOT NULL,
    "scores_json" JSONB NOT NULL,
    "full_result_json" JSONB NOT NULL,
    "engine_version" VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scae_assessment_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scae_report_deliveries" (
    "id" TEXT NOT NULL,
    "result_id" TEXT NOT NULL,
    "sent_by_id" TEXT NOT NULL,
    "recipient_email" VARCHAR(255) NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "token_expires_at" TIMESTAMP(3) NOT NULL,
    "delivery_state" VARCHAR(20) NOT NULL DEFAULT 'sent',
    "opened_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scae_report_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scae_assessment_releases_userId_idx" ON "scae_assessment_releases"("userId");

-- CreateIndex
CREATE INDEX "scae_assessment_releases_classId_idx" ON "scae_assessment_releases"("classId");

-- CreateIndex
CREATE INDEX "scae_assessment_releases_state_idx" ON "scae_assessment_releases"("state");

-- CreateIndex
CREATE UNIQUE INDEX "scae_assessment_releases_userId_instrument_state_key" ON "scae_assessment_releases"("userId", "instrument", "state");

-- CreateIndex
CREATE UNIQUE INDEX "scae_assessments_release_id_key" ON "scae_assessments"("release_id");

-- CreateIndex
CREATE INDEX "scae_assessments_userId_idx" ON "scae_assessments"("userId");

-- CreateIndex
CREATE INDEX "scae_assessments_instrument_idx" ON "scae_assessments"("instrument");

-- CreateIndex
CREATE INDEX "scae_assessments_state_idx" ON "scae_assessments"("state");

-- CreateIndex
CREATE UNIQUE INDEX "scae_assessment_results_assessment_id_key" ON "scae_assessment_results"("assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "scae_report_deliveries_token_hash_key" ON "scae_report_deliveries"("token_hash");

-- CreateIndex
CREATE INDEX "scae_report_deliveries_result_id_idx" ON "scae_report_deliveries"("result_id");

-- CreateIndex
CREATE INDEX "scae_report_deliveries_token_hash_idx" ON "scae_report_deliveries"("token_hash");

-- AddForeignKey
ALTER TABLE "scae_assessment_releases" ADD CONSTRAINT "scae_assessment_releases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "scae_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_assessment_releases" ADD CONSTRAINT "scae_assessment_releases_released_by_id_fkey" FOREIGN KEY ("released_by_id") REFERENCES "scae_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_assessment_releases" ADD CONSTRAINT "scae_assessment_releases_classId_fkey" FOREIGN KEY ("classId") REFERENCES "scae_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_assessments" ADD CONSTRAINT "scae_assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "scae_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_assessments" ADD CONSTRAINT "scae_assessments_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "scae_assessment_releases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_assessment_results" ADD CONSTRAINT "scae_assessment_results_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "scae_assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_report_deliveries" ADD CONSTRAINT "scae_report_deliveries_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "scae_assessment_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scae_report_deliveries" ADD CONSTRAINT "scae_report_deliveries_sent_by_id_fkey" FOREIGN KEY ("sent_by_id") REFERENCES "scae_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
