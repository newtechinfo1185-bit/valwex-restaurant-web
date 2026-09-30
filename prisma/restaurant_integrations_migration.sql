ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'POS',
  ADD COLUMN IF NOT EXISTS "externalOrderId" TEXT,
  ADD COLUMN IF NOT EXISTS "customerName" TEXT,
  ADD COLUMN IF NOT EXISTS "customerPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "deliveryAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "fulfillmentType" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "orders_restaurantId_source_externalOrderId_key"
  ON "orders" ("restaurantId", "source", "externalOrderId");

CREATE TABLE IF NOT EXISTS "restaurant_integrations" (
  "id" TEXT NOT NULL,
  "restaurantId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "outletId" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "apiBaseUrl" TEXT,
  "apiKeyEncrypted" TEXT,
  "apiSecretEncrypted" TEXT,
  "webhookTokenHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "restaurant_integrations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "restaurant_integrations_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "restaurant_integrations_restaurantId_provider_key"
  ON "restaurant_integrations" ("restaurantId", "provider");
