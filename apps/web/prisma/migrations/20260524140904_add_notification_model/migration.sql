-- CreateTable
CREATE TABLE "scae_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scae_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scae_notifications_userId_idx" ON "scae_notifications"("userId");

-- CreateIndex
CREATE INDEX "scae_notifications_userId_isRead_idx" ON "scae_notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "scae_notifications_createdAt_idx" ON "scae_notifications"("createdAt");

-- AddForeignKey
ALTER TABLE "scae_notifications" ADD CONSTRAINT "scae_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "scae_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
