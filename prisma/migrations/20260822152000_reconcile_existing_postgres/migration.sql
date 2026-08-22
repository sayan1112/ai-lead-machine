-- The linked Prisma Postgres database already contained the pre-baseline
-- schema. Backfill the newer tenant-scoped columns before adding constraints.

DROP INDEX IF EXISTS "follow_ups_scheduledAt_idx";
DROP INDEX IF EXISTS "leads_source_idx";
DROP INDEX IF EXISTS "leads_status_idx";

ALTER TABLE "conversations" ADD COLUMN "organizationId" TEXT;
UPDATE "conversations" AS c
SET "organizationId" = l."organizationId"
FROM "leads" AS l
WHERE l."id" = c."leadId";
ALTER TABLE "conversations" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "messages" ADD COLUMN "organizationId" TEXT;
UPDATE "messages" AS m
SET "organizationId" = c."organizationId"
FROM "conversations" AS c
WHERE c."id" = m."conversationId";
ALTER TABLE "messages" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "lead_scores" ADD COLUMN "organizationId" TEXT;
UPDATE "lead_scores" AS s
SET "organizationId" = l."organizationId"
FROM "leads" AS l
WHERE l."id" = s."leadId";
ALTER TABLE "lead_scores" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "follow_ups" ADD COLUMN "organizationId" TEXT;
UPDATE "follow_ups" AS f
SET "organizationId" = l."organizationId"
FROM "leads" AS l
WHERE l."id" = f."leadId";
ALTER TABLE "follow_ups" ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "follow_ups"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "follow_ups" ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "leads"
  ADD COLUMN "classification" TEXT NOT NULL DEFAULT 'COLD',
  ADD COLUMN "possessionPreference" TEXT,
  ADD COLUMN "score" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "conversations_organizationId_updatedAt_idx"
  ON "conversations"("organizationId", "updatedAt");
CREATE INDEX "follow_ups_organizationId_scheduledAt_idx"
  ON "follow_ups"("organizationId", "scheduledAt");
CREATE INDEX "lead_scores_organizationId_createdAt_idx"
  ON "lead_scores"("organizationId", "createdAt");
CREATE INDEX "leads_organizationId_status_idx"
  ON "leads"("organizationId", "status");
CREATE INDEX "leads_organizationId_source_idx"
  ON "leads"("organizationId", "source");
CREATE INDEX "leads_organizationId_createdAt_idx"
  ON "leads"("organizationId", "createdAt");
CREATE INDEX "messages_organizationId_createdAt_idx"
  ON "messages"("organizationId", "createdAt");

ALTER TABLE "lead_scores"
  ADD CONSTRAINT "lead_scores_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations"
  ADD CONSTRAINT "conversations_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages"
  ADD CONSTRAINT "messages_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "follow_ups"
  ADD CONSTRAINT "follow_ups_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
