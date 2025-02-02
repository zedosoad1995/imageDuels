-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Duel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outcome" TEXT,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "image1Id" TEXT NOT NULL,
    "image2Id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "activeUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Duel_image1Id_fkey" FOREIGN KEY ("image1Id") REFERENCES "Image" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Duel_image2Id_fkey" FOREIGN KEY ("image2Id") REFERENCES "Image" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Duel_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Duel_activeUserId_fkey" FOREIGN KEY ("activeUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Duel" ("createdAt", "id", "image1Id", "image2Id", "isFinished", "outcome", "voterId") SELECT "createdAt", "id", "image1Id", "image2Id", "isFinished", "outcome", "voterId" FROM "Duel";
DROP TABLE "Duel";
ALTER TABLE "new_Duel" RENAME TO "Duel";
CREATE UNIQUE INDEX "Duel_activeUserId_key" ON "Duel"("activeUserId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
