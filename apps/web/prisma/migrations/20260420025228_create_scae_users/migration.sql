-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'SCHOOL_MANAGER', 'MUNICIPAL_MANAGER', 'ADMIN');

-- CreateTable
CREATE TABLE "scae_users" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "registrationNumber" TEXT,
    "birthDate" TIMESTAMP(3),
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "scae_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scae_users_email_key" ON "scae_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "scae_users_registrationNumber_key" ON "scae_users"("registrationNumber");

-- CreateIndex
CREATE INDEX "scae_users_email_idx" ON "scae_users"("email");

-- CreateIndex
CREATE INDEX "scae_users_registrationNumber_idx" ON "scae_users"("registrationNumber");

-- CreateIndex
CREATE INDEX "scae_users_role_idx" ON "scae_users"("role");
