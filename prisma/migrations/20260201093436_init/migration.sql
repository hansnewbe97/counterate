-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DISPLAY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "pairedUserId" TEXT,
    CONSTRAINT "User_pairedUserId_fkey" FOREIGN KEY ("pairedUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DisplayConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT,
    "refreshInterval" INTEGER NOT NULL DEFAULT 60,
    "marqueeText" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "leftLogoUrl" TEXT,
    "leftTitle" TEXT DEFAULT 'Counterate',
    "leftSubtitle" TEXT DEFAULT 'Money Changer',
    "rightLogoUrl" TEXT,
    "rightTitle" TEXT,
    "showClock" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DisplayConfig_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForexRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT,
    "currency" TEXT NOT NULL,
    "currencyName" TEXT NOT NULL DEFAULT '',
    "ttBuy" REAL NOT NULL DEFAULT 0,
    "ttSell" REAL NOT NULL DEFAULT 0,
    "bankBuy" REAL NOT NULL DEFAULT 0,
    "bankSell" REAL NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ForexRate_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DepositRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT,
    "tenor" INTEGER NOT NULL,
    "rate" REAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DepositRate_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoDisplay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VideoDisplay_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoDisplayId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "VideoSource_videoDisplayId_fkey" FOREIGN KEY ("videoDisplayId") REFERENCES "VideoDisplay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_pairedUserId_key" ON "User"("pairedUserId");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "DisplayConfig_adminId_key" ON "DisplayConfig"("adminId");

-- CreateIndex
CREATE INDEX "ForexRate_adminId_active_order_idx" ON "ForexRate"("adminId", "active", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ForexRate_adminId_currency_key" ON "ForexRate"("adminId", "currency");

-- CreateIndex
CREATE INDEX "DepositRate_adminId_active_order_idx" ON "DepositRate"("adminId", "active", "order");

-- CreateIndex
CREATE UNIQUE INDEX "VideoDisplay_adminId_key" ON "VideoDisplay"("adminId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");
