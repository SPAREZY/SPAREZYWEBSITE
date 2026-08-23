-- CreateTable
CREATE TABLE "PartRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "humanId" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Multiple',
    "position" TEXT,
    "partsJson" TEXT,
    "partNumber" TEXT,
    "photoUrl" TEXT,
    "customerNote" TEXT,
    "aiTranscript" TEXT,
    "internalNote" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "assignee" TEXT,
    "tags" TEXT,
    "lastContactedAt" DATETIME,
    "vin" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "customerName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "address" TEXT,
    "contactPref" TEXT NOT NULL,
    "partPreference" TEXT NOT NULL DEFAULT 'any',
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourcingAt" DATETIME,
    "quotedAt" DATETIME,
    "confirmedAt" DATETIME,
    "completedAt" DATETIME,
    "declinedAt" DATETIME,
    "declineReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PartRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "condition" TEXT NOT NULL,
    "warranty" TEXT,
    "eta" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PartRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PartRequest_humanId_key" ON "PartRequest"("humanId");

-- CreateIndex
CREATE INDEX "ActivityLog_requestId_idx" ON "ActivityLog"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_requestId_key" ON "Quote"("requestId");

