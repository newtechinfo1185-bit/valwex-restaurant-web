-- Additive staff QR/PIN login fields. Existing user and order records are untouched.
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "staffPinHash" TEXT,
  ADD COLUMN IF NOT EXISTS "staffQrTokenHash" TEXT;
