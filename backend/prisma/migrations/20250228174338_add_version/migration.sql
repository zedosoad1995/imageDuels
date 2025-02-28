-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filepath" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "ratingDeviation" REAL NOT NULL,
    "volatility" REAL NOT NULL,
    "numVotes" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collectionId" TEXT NOT NULL,
    CONSTRAINT "Image_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("collectionId", "createdAt", "filepath", "id", "numVotes", "rating", "ratingDeviation", "volatility") SELECT "collectionId", "createdAt", "filepath", "id", "numVotes", "rating", "ratingDeviation", "volatility" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
