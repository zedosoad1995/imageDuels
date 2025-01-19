-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "question" TEXT,
    "mode" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Collection_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Collection" ("description", "id", "mode", "ownerId", "question", "title") SELECT "description", "id", "mode", "ownerId", "question", "title" FROM "Collection";
DROP TABLE "Collection";
ALTER TABLE "new_Collection" RENAME TO "Collection";
CREATE TABLE "new_Duel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "outcome" TEXT NOT NULL,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "image1Id" TEXT NOT NULL,
    "image2Id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Duel_image1Id_fkey" FOREIGN KEY ("image1Id") REFERENCES "Image" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Duel_image2Id_fkey" FOREIGN KEY ("image2Id") REFERENCES "Image" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Duel_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Duel" ("id", "image1Id", "image2Id", "isActive", "isFinished", "outcome", "voterId") SELECT "id", "image1Id", "image2Id", "isActive", "isFinished", "outcome", "voterId" FROM "Duel";
DROP TABLE "Duel";
ALTER TABLE "new_Duel" RENAME TO "Duel";
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filepath" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "ratingDeviation" REAL NOT NULL,
    "volatility" REAL NOT NULL,
    "numVotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Image" ("filepath", "id", "numVotes", "rating", "ratingDeviation", "volatility") SELECT "filepath", "id", "numVotes", "rating", "ratingDeviation", "volatility" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("email", "id", "password") SELECT "email", "id", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
