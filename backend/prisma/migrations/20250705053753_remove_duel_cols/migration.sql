/*
  Warnings:

  - You are about to drop the column `activeUserId` on the `Duel` table. All the data in the column will be lost.
  - You are about to drop the column `isFinished` on the `Duel` table. All the data in the column will be lost.
  - Made the column `outcome` on table `Duel` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Duel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outcome" TEXT NOT NULL,
    "image1Id" TEXT NOT NULL,
    "image2Id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Duel_image1Id_fkey" FOREIGN KEY ("image1Id") REFERENCES "Image" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Duel_image2Id_fkey" FOREIGN KEY ("image2Id") REFERENCES "Image" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Duel_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Duel" ("createdAt", "id", "image1Id", "image2Id", "outcome", "voterId") SELECT "createdAt", "id", "image1Id", "image2Id", "outcome", "voterId" FROM "Duel";
DROP TABLE "Duel";
ALTER TABLE "new_Duel" RENAME TO "Duel";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
