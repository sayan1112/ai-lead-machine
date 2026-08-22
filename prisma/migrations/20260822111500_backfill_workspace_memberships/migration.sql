-- Existing demo databases were created before workspace memberships were enforced.
-- Backfill the owning membership without changing any user or organization data.
INSERT INTO "organization_members" ("id", "organizationId", "userId", "role", "joinedAt")
SELECT 'membership_' || u."id", u."organizationId", u."id", 'OWNER', CURRENT_TIMESTAMP
FROM "users" u
WHERE u."organizationId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "organization_members" m
    WHERE m."organizationId" = u."organizationId" AND m."userId" = u."id"
  );
