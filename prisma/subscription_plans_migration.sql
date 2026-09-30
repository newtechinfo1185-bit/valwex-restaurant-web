ALTER TYPE "LicenseDuration" ADD VALUE IF NOT EXISTS 'MONTHS_3';

DO $$ BEGIN
  CREATE TYPE "PlanInterval" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "subscription_plans" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "interval" "PlanInterval" NOT NULL,
  "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "subscription_plans_name_interval_key"
  ON "subscription_plans" ("name", "interval");
CREATE INDEX IF NOT EXISTS "subscription_plans_isActive_sortOrder_idx"
  ON "subscription_plans" ("isActive", "sortOrder");

ALTER TABLE "licenses"
  ADD COLUMN IF NOT EXISTS "planId" TEXT,
  ADD COLUMN IF NOT EXISTS "planName" TEXT,
  ADD COLUMN IF NOT EXISTS "planPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

DO $$ BEGIN
  ALTER TABLE "licenses"
    ADD CONSTRAINT "licenses_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS "licenses_planId_idx" ON "licenses" ("planId");
