/*
  Warnings:

  - You are about to drop the column `isValid` on the `Collection` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "question" TEXT,
    "mode" TEXT NOT NULL,
    "isNSFW" BOOLEAN NOT NULL DEFAULT false,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Collection_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Collection" ("createdAt", "description", "id", "isLive", "isNSFW", "mode", "ownerId", "question", "title") SELECT "createdAt", "description", "id", "isLive", "isNSFW", "mode", "ownerId", "question", "title" FROM "Collection";
DROP TABLE "Collection";
ALTER TABLE "new_Collection" RENAME TO "Collection";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
