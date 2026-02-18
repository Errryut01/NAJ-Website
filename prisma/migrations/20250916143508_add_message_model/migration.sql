-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientTitle" TEXT,
    "recipientCompany" TEXT,
    "recipientEmail" TEXT,
    "linkedinProfileUrl" TEXT,
    "message" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "platform" TEXT NOT NULL,
    "sentAt" DATETIME,
    "deliveredAt" DATETIME,
    "readAt" DATETIME,
    "repliedAt" DATETIME,
    "replyMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Message_userId_status_idx" ON "Message"("userId", "status");

-- CreateIndex
CREATE INDEX "Message_userId_messageType_idx" ON "Message"("userId", "messageType");

-- CreateIndex
CREATE INDEX "Message_sentAt_idx" ON "Message"("sentAt");
