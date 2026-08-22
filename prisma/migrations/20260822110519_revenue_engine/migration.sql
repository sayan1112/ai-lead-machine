/*
  Warnings:

  - Added the required column `organizationId` to the `conversations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `follow_ups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `lead_scores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'WEB',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "extractedData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "conversations_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "conversations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_conversations" ("channel", "createdAt", "extractedData", "id", "leadId", "organizationId", "status", "updatedAt") SELECT c."channel", c."createdAt", c."extractedData", c."id", c."leadId", l."organizationId", c."status", c."updatedAt" FROM "conversations" c JOIN "leads" l ON l."id" = c."leadId";
DROP TABLE "conversations";
ALTER TABLE "new_conversations" RENAME TO "conversations";
CREATE INDEX "conversations_leadId_idx" ON "conversations"("leadId");
CREATE INDEX "conversations_organizationId_updatedAt_idx" ON "conversations"("organizationId", "updatedAt");
CREATE TABLE "new_follow_ups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "stepId" TEXT,
    "scheduledAt" DATETIME NOT NULL,
    "executedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "channel" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "follow_ups_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "follow_ups_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_follow_ups" ("channel", "createdAt", "executedAt", "id", "leadId", "message", "organizationId", "scheduledAt", "status", "stepId") SELECT f."channel", f."createdAt", f."executedAt", f."id", f."leadId", f."message", l."organizationId", f."scheduledAt", f."status", f."stepId" FROM "follow_ups" f JOIN "leads" l ON l."id" = f."leadId";
DROP TABLE "follow_ups";
ALTER TABLE "new_follow_ups" RENAME TO "follow_ups";
CREATE INDEX "follow_ups_leadId_idx" ON "follow_ups"("leadId");
CREATE INDEX "follow_ups_organizationId_scheduledAt_idx" ON "follow_ups"("organizationId", "scheduledAt");
CREATE TABLE "new_lead_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "classification" TEXT NOT NULL DEFAULT 'COLD',
    "budgetMatch" INTEGER NOT NULL DEFAULT 0,
    "timelineScore" INTEGER NOT NULL DEFAULT 0,
    "engagementScore" INTEGER NOT NULL DEFAULT 0,
    "propertyInterestScore" INTEGER NOT NULL DEFAULT 0,
    "locationMatch" INTEGER NOT NULL DEFAULT 0,
    "conversationScore" INTEGER NOT NULL DEFAULT 0,
    "reasoning" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lead_scores_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lead_scores_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_lead_scores" ("budgetMatch", "classification", "conversationScore", "createdAt", "engagementScore", "id", "leadId", "locationMatch", "organizationId", "propertyInterestScore", "reasoning", "score", "timelineScore", "updatedAt") SELECT s."budgetMatch", s."classification", s."conversationScore", s."createdAt", s."engagementScore", s."id", s."leadId", s."locationMatch", l."organizationId", s."propertyInterestScore", s."reasoning", s."score", s."timelineScore", s."updatedAt" FROM "lead_scores" s JOIN "leads" l ON l."id" = s."leadId";
DROP TABLE "lead_scores";
ALTER TABLE "new_lead_scores" RENAME TO "lead_scores";
CREATE INDEX "lead_scores_leadId_idx" ON "lead_scores"("leadId");
CREATE INDEX "lead_scores_organizationId_createdAt_idx" ON "lead_scores"("organizationId", "createdAt");
CREATE TABLE "new_leads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "propertyType" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "budget" INTEGER,
    "location" TEXT,
    "timeline" TEXT,
    "possession" TEXT,
    "intent" TEXT,
    "possessionPreference" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "classification" TEXT NOT NULL DEFAULT 'COLD',
    "notes" TEXT,
    "lastActivityAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdById" TEXT,
    CONSTRAINT "leads_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "leads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "leads_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_leads" ("assignedToId", "bathrooms", "bedrooms", "budget", "createdAt", "createdById", "email", "id", "intent", "lastActivityAt", "location", "name", "notes", "organizationId", "phone", "possession", "propertyType", "source", "status", "timeline", "updatedAt") SELECT "assignedToId", "bathrooms", "bedrooms", "budget", "createdAt", "createdById", "email", "id", "intent", "lastActivityAt", "location", "name", "notes", "organizationId", "phone", "possession", "propertyType", "source", "status", "timeline", "updatedAt" FROM "leads";
DROP TABLE "leads";
ALTER TABLE "new_leads" RENAME TO "leads";
CREATE INDEX "leads_organizationId_idx" ON "leads"("organizationId");
CREATE INDEX "leads_organizationId_status_idx" ON "leads"("organizationId", "status");
CREATE INDEX "leads_organizationId_source_idx" ON "leads"("organizationId", "source");
CREATE INDEX "leads_organizationId_createdAt_idx" ON "leads"("organizationId", "createdAt");
CREATE TABLE "new_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "extractedData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "messages_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_messages" ("content", "conversationId", "createdAt", "extractedData", "id", "organizationId", "role") SELECT m."content", m."conversationId", m."createdAt", m."extractedData", m."id", c."organizationId", m."role" FROM "messages" m JOIN "conversations" c ON c."id" = m."conversationId";
DROP TABLE "messages";
ALTER TABLE "new_messages" RENAME TO "messages";
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");
CREATE INDEX "messages_organizationId_createdAt_idx" ON "messages"("organizationId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
