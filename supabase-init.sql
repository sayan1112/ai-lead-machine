-- =========================================================
-- AI LEAD MACHINE MVP - FULL SCHEMA & SEED FOR SUPABASE
-- Run this in Supabase SQL Editor
-- =========================================================

-- 1. Create Schema and Tables
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "organization_members" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "invitedBy" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "leads" (
    "id" TEXT NOT NULL,
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
    "lastActivityAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdById" TEXT,
    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "lead_scores" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_scores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "conversations" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'WEB',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "extractedData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "extractedData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "properties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectName" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "location" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "price" INTEGER NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "area" DOUBLE PRECISION,
    "possessionStatus" TEXT,
    "possessionDate" TIMESTAMP(3),
    "amenities" TEXT,
    "description" TEXT,
    "images" TEXT,
    "availableUnits" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "appointments" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "propertyId" TEXT,
    "assignedToId" TEXT,
    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "follow_up_sequences" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggerEvent" TEXT NOT NULL DEFAULT 'NEW_LEAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "follow_up_sequences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "follow_up_steps" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "delayHours" INTEGER NOT NULL DEFAULT 24,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "follow_up_steps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "follow_ups" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "stepId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "executedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "channel" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ai_configs" (
    "id" TEXT NOT NULL,
    "agentName" TEXT NOT NULL DEFAULT 'AI Sales Agent',
    "businessName" TEXT,
    "businessDescription" TEXT,
    "tone" TEXT NOT NULL DEFAULT 'professional',
    "languages" TEXT NOT NULL DEFAULT 'en',
    "workingHours" TEXT,
    "companyPhone" TEXT,
    "companyEmail" TEXT,
    "aiInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "ai_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "integrations" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_CONNECTED',
    "config" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "activities" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,
    "leadId" TEXT,
    "userId" TEXT,
    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'STARTER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- 2. Create Unique Constraints & Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_slug_key" ON "organizations"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "organization_members_organizationId_userId_key" ON "organization_members"("organizationId", "userId");
CREATE INDEX IF NOT EXISTS "leads_organizationId_idx" ON "leads"("organizationId");
CREATE INDEX IF NOT EXISTS "leads_organizationId_status_idx" ON "leads"("organizationId", "status");
CREATE INDEX IF NOT EXISTS "leads_organizationId_source_idx" ON "leads"("organizationId", "source");
CREATE INDEX IF NOT EXISTS "leads_organizationId_createdAt_idx" ON "leads"("organizationId", "createdAt");
CREATE INDEX IF NOT EXISTS "lead_scores_leadId_idx" ON "lead_scores"("leadId");
CREATE INDEX IF NOT EXISTS "lead_scores_organizationId_createdAt_idx" ON "lead_scores"("organizationId", "createdAt");
CREATE INDEX IF NOT EXISTS "conversations_leadId_idx" ON "conversations"("leadId");
CREATE INDEX IF NOT EXISTS "conversations_organizationId_updatedAt_idx" ON "conversations"("organizationId", "updatedAt");
CREATE INDEX IF NOT EXISTS "messages_conversationId_idx" ON "messages"("conversationId");
CREATE INDEX IF NOT EXISTS "messages_organizationId_createdAt_idx" ON "messages"("organizationId", "createdAt");
CREATE INDEX IF NOT EXISTS "properties_organizationId_idx" ON "properties"("organizationId");
CREATE INDEX IF NOT EXISTS "properties_location_idx" ON "properties"("location");
CREATE INDEX IF NOT EXISTS "appointments_organizationId_idx" ON "appointments"("organizationId");
CREATE INDEX IF NOT EXISTS "appointments_leadId_idx" ON "appointments"("leadId");
CREATE INDEX IF NOT EXISTS "appointments_date_idx" ON "appointments"("date");
CREATE INDEX IF NOT EXISTS "follow_up_sequences_organizationId_idx" ON "follow_up_sequences"("organizationId");
CREATE INDEX IF NOT EXISTS "follow_up_steps_sequenceId_idx" ON "follow_up_steps"("sequenceId");
CREATE INDEX IF NOT EXISTS "follow_ups_leadId_idx" ON "follow_ups"("leadId");
CREATE INDEX IF NOT EXISTS "follow_ups_organizationId_scheduledAt_idx" ON "follow_ups"("organizationId", "scheduledAt");
CREATE UNIQUE INDEX IF NOT EXISTS "ai_configs_organizationId_key" ON "ai_configs"("organizationId");
CREATE UNIQUE INDEX IF NOT EXISTS "integrations_organizationId_type_key" ON "integrations"("organizationId", "type");
CREATE INDEX IF NOT EXISTS "activities_organizationId_idx" ON "activities"("organizationId");
CREATE INDEX IF NOT EXISTS "activities_leadId_idx" ON "activities"("leadId");
CREATE INDEX IF NOT EXISTS "activities_createdAt_idx" ON "activities"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_stripeCustomerId_key" ON "subscriptions"("stripeCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- 3. Seed Initial Demo Data
INSERT INTO "organizations" ("id", "name", "slug", "description", "createdAt", "updatedAt")
VALUES ('org_demo_01', 'AI Lead Machine Demo Workspace', 'ai-lead-machine-demo', 'A realistic demo workspace for real estate sales teams.', NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "users" ("id", "name", "email", "password", "organizationId", "createdAt", "updatedAt")
VALUES ('user_demo_01', 'Arjun Malhotra', 'demo@aileadmachine.com', '$2b$10$QP0b73wEsNCWuVWqklSwjOKAl7TYiT/DTnnYlpcjTMDPXuhNfI/PK', 'org_demo_01', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "leads" ("id", "name", "email", "phone", "organizationId", "createdById", "assignedToId", "source", "status", "propertyType", "bedrooms", "bathrooms", "budget", "location", "timeline", "possession", "intent", "classification", "score", "notes", "createdAt", "updatedAt")
VALUES
('lead_01', 'Aarav Mehta', 'aarav.mehta@demo.aileadmachine.com', '+91 98765 41021', 'org_demo_01', 'user_demo_01', 'user_demo_01', 'PROPERTY_PORTAL', 'QUALIFIED', 'Apartment', 2, 2, 8500000, 'Baner, Pune', '3 months', 'Ready to move', 'high', 'HOT', 88, 'Interested in a family-friendly 2BHK close to schools and transit.', NOW(), NOW()),
('lead_02', 'Priya Sharma', 'priya.sharma@demo.aileadmachine.com', '+91 98204 77118', 'org_demo_01', 'user_demo_01', 'user_demo_01', 'WHATSAPP', 'APPOINTMENT', 'Apartment', 3, 3, 12000000, 'Andheri West, Mumbai', '6 months', 'Under construction', 'high', 'HOT', 92, 'Looking for a 3BHK family home with strong rental potential.', NOW(), NOW()),
('lead_03', 'Rahul Sen', 'rahul.sen@demo.aileadmachine.com', '+91 98310 22409', 'org_demo_01', 'user_demo_01', 'user_demo_01', 'REFERRAL', 'NEW', 'Apartment', 2, 2, 7000000, 'New Town, Kolkata', '1 year', 'Under construction', 'medium', 'WARM', 65, 'Exploring investment property options with a long-term view.', NOW(), NOW()),
('lead_04', 'Ananya Kapoor', 'ananya.kapoor@demo.aileadmachine.com', '+91 98190 66342', 'org_demo_01', 'user_demo_01', 'user_demo_01', 'GOOGLE_ADS', 'CONTACTED', 'Apartment', 3, 3, 15000000, 'Kalyani Nagar, Pune', '3 months', 'Ready to move', 'high', 'HOT', 85, 'Looking for a premium apartment with concierge amenities.', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "properties" ("id", "name", "projectName", "type", "status", "location", "address", "city", "state", "price", "bedrooms", "bathrooms", "area", "possessionStatus", "amenities", "description", "availableUnits", "organizationId", "createdAt", "updatedAt")
VALUES
('prop_01', 'Modern 2BHK Apartment', 'Baner Heights', 'Apartment', 'AVAILABLE', 'Baner, Pune', 'Main Road, Baner', 'Pune', 'Maharashtra', 8500000, 2, 2, 1050, 'Ready to move', 'Gym, clubhouse, covered parking', 'A bright 2BHK apartment designed for comfortable family living.', 4, 'org_demo_01', NOW(), NOW()),
('prop_02', 'Premium 3BHK Residence', 'Kharadi Central', 'Apartment', 'AVAILABLE', 'Kharadi, Pune', 'EON Road, Kharadi', 'Pune', 'Maharashtra', 12500000, 3, 3, 1680, 'Under construction', 'Pool, clubhouse, work lounge', 'A premium 3BHK residence close to Pune''s commercial corridor.', 7, 'org_demo_01', NOW(), NOW()),
('prop_03', 'Luxury 4BHK Villa', 'Whitefield Gardens', 'Villa', 'AVAILABLE', 'Whitefield, Bengaluru', 'Hope Farm Junction, Whitefield', 'Bengaluru', 'Karnataka', 24000000, 4, 4, 3200, 'Ready to move', 'Private garden, smart home, parking', 'A spacious independent villa for buyers seeking privacy and convenience.', 2, 'org_demo_01', NOW(), NOW()),
('prop_04', 'Commercial Office Space', 'Hinjewadi Business Park', 'Commercial', 'AVAILABLE', 'Hinjewadi, Pune', 'Phase 1, Hinjewadi', 'Pune', 'Maharashtra', 18000000, NULL, NULL, 2400, 'Ready to move', 'Reception, visitor parking, power backup', 'A professionally managed office space for growing businesses.', 3, 'org_demo_01', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "appointments" ("id", "date", "duration", "status", "notes", "organizationId", "leadId", "propertyId", "assignedToId", "createdAt", "updatedAt")
VALUES
('appt_01', NOW() + INTERVAL '4 hours', 60, 'CONFIRMED', 'Property Visit — review layout, parking, and school access.', 'org_demo_01', 'lead_01', 'prop_01', 'user_demo_01', NOW(), NOW()),
('appt_02', NOW() + INTERVAL '24 hours', 45, 'SCHEDULED', 'Client Consultation — discuss 3BHK investment priorities.', 'org_demo_01', 'lead_02', 'prop_02', 'user_demo_01', NOW(), NOW()),
('appt_03', NOW() + INTERVAL '26 hours', 60, 'SCHEDULED', 'Site Visit — walk through premium residential project.', 'org_demo_01', 'lead_03', 'prop_03', 'user_demo_01', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;
