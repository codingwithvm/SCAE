-- DropIndex
DROP INDEX "scae_assessment_releases_userId_instrument_state_key";

-- CreateIndex (partial: only prevents duplicate PENDING or IN_USE per user+instrument)
CREATE UNIQUE INDEX "unique_active_release"
  ON "scae_assessment_releases" ("userId", "instrument", "state")
  WHERE "state" IN ('PENDING', 'IN_USE');
