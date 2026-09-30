CREATE TABLE IF NOT EXISTS "LicenseEvent" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "deviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LicenseEvent_pkey"
        PRIMARY KEY ("id"),

    CONSTRAINT "LicenseEvent_licenseId_fkey"
        FOREIGN KEY ("licenseId")
        REFERENCES "License"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
);