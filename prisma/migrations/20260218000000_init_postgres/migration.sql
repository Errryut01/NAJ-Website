-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('DRAFT', 'APPLIED', 'INTERVIEW', 'REJECTED', 'OFFER', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('CONNECTION_REQUEST', 'FOLLOW_UP', 'THANK_YOU', 'INTEREST_EXPRESSION', 'JOB_INQUIRY');

-- CreateEnum
CREATE TYPE "public"."MessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'REPLIED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePictureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LinkedInCredentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInCredentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LinkedInConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "linkedinId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "profileUrl" TEXT NOT NULL,
    "connectionUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "connectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LinkedInMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "jobApplicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "summary" TEXT,
    "currentTitle" TEXT,
    "currentCompany" TEXT,
    "yearsExperience" INTEGER,
    "skills" JSONB,
    "experience" JSONB,
    "education" JSONB,
    "resumeUrl" TEXT,
    "coverLetterTemplate" TEXT,
    "age" TEXT,
    "race" TEXT,
    "ethnicity" TEXT,
    "veteranStatus" TEXT,
    "politicalOrientation" TEXT,
    "socialMediaUse" JSONB,
    "workingHours" JSONB,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobSearchPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobTitles" JSONB,
    "companies" JSONB,
    "locations" JSONB,
    "salaryMin" INTEGER,
    "jobTypes" JSONB,
    "remoteWork" BOOLEAN NOT NULL DEFAULT false,
    "maxApplicationsPerMonth" INTEGER NOT NULL DEFAULT 10,
    "autoApply" BOOLEAN NOT NULL DEFAULT false,
    "autoConnect" BOOLEAN NOT NULL DEFAULT false,
    "autoMessage" BOOLEAN NOT NULL DEFAULT false,
    "connectionMessage" TEXT,
    "followUpMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSearchPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "jobUrl" TEXT,
    "jobDescription" TEXT,
    "location" TEXT,
    "salary" TEXT,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "appliedAt" TIMESTAMP(3),
    "resumeUrl" TEXT,
    "coverLetterUrl" TEXT,
    "companyApplicationMonth" TEXT NOT NULL,
    "currentStage" TEXT,
    "nextActions" JSONB,
    "lastContactDate" TIMESTAMP(3),
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobApplicationId" TEXT,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "email" TEXT,
    "linkedInUrl" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GeneratedMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobApplicationId" TEXT,
    "contactId" TEXT,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "messageType" "public"."MessageType" NOT NULL DEFAULT 'INTEREST_EXPRESSION',
    "status" "public"."MessageStatus" NOT NULL DEFAULT 'PENDING',
    "platform" TEXT NOT NULL DEFAULT 'email',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "replyMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobApplicationQuestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplicationQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GrokCredentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrokCredentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CalendarConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "calendarId" TEXT,
    "calendarName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientTitle" TEXT,
    "recipientCompany" TEXT,
    "recipientEmail" TEXT,
    "linkedinProfileUrl" TEXT,
    "message" TEXT NOT NULL,
    "messageType" "public"."MessageType" NOT NULL,
    "status" "public"."MessageStatus" NOT NULL DEFAULT 'PENDING',
    "platform" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "replyMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobSearchCache" (
    "id" TEXT NOT NULL,
    "searchKey" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSearchCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedInCredentials_userId_key" ON "public"."LinkedInCredentials"("userId");

-- CreateIndex
CREATE INDEX "LinkedInConnection_userId_idx" ON "public"."LinkedInConnection"("userId");

-- CreateIndex
CREATE INDEX "LinkedInMessage_connectionId_idx" ON "public"."LinkedInMessage"("connectionId");

-- CreateIndex
CREATE INDEX "LinkedInMessage_userId_idx" ON "public"."LinkedInMessage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "public"."UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSearchPreferences_userId_key" ON "public"."JobSearchPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_userId_company_companyApplicationMonth_key" ON "public"."JobApplication"("userId", "company", "companyApplicationMonth");

-- CreateIndex
CREATE INDEX "Contact_userId_approved_idx" ON "public"."Contact"("userId", "approved");

-- CreateIndex
CREATE INDEX "Contact_jobApplicationId_idx" ON "public"."Contact"("jobApplicationId");

-- CreateIndex
CREATE INDEX "GeneratedMessage_userId_status_idx" ON "public"."GeneratedMessage"("userId", "status");

-- CreateIndex
CREATE INDEX "GeneratedMessage_contactId_idx" ON "public"."GeneratedMessage"("contactId");

-- CreateIndex
CREATE INDEX "GeneratedMessage_jobApplicationId_idx" ON "public"."GeneratedMessage"("jobApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationQuestion_userId_key" ON "public"."JobApplicationQuestion"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GrokCredentials_userId_key" ON "public"."GrokCredentials"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarConnection_userId_provider_calendarId_key" ON "public"."CalendarConnection"("userId", "provider", "calendarId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailConnection_userId_provider_email_key" ON "public"."EmailConnection"("userId", "provider", "email");

-- CreateIndex
CREATE INDEX "Message_userId_status_idx" ON "public"."Message"("userId", "status");

-- CreateIndex
CREATE INDEX "Message_userId_messageType_idx" ON "public"."Message"("userId", "messageType");

-- CreateIndex
CREATE INDEX "Message_sentAt_idx" ON "public"."Message"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSearchCache_searchKey_key" ON "public"."JobSearchCache"("searchKey");

-- CreateIndex
CREATE INDEX "JobSearchCache_createdAt_idx" ON "public"."JobSearchCache"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."LinkedInCredentials" ADD CONSTRAINT "LinkedInCredentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkedInConnection" ADD CONSTRAINT "LinkedInConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkedInMessage" ADD CONSTRAINT "LinkedInMessage_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "public"."LinkedInConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkedInMessage" ADD CONSTRAINT "LinkedInMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobSearchPreferences" ADD CONSTRAINT "JobSearchPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "public"."JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GeneratedMessage" ADD CONSTRAINT "GeneratedMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GeneratedMessage" ADD CONSTRAINT "GeneratedMessage_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "public"."JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GeneratedMessage" ADD CONSTRAINT "GeneratedMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobApplicationQuestion" ADD CONSTRAINT "JobApplicationQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GrokCredentials" ADD CONSTRAINT "GrokCredentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CalendarConnection" ADD CONSTRAINT "CalendarConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailConnection" ADD CONSTRAINT "EmailConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

