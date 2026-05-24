-- AlterTable
ALTER TABLE "scae_users" ADD COLUMN     "mceUnlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "scaeProfile" TEXT;
