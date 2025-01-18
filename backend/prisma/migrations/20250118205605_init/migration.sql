-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "question" TEXT,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Collection_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filepath" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "ratingDeviation" REAL NOT NULL,
    "volatility" REAL NOT NULL,
    "numVotes" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Duel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "outcome" TEXT NOT NULL,
    "isFinished" BOOLEAN NOT NULL DEFAULT false,
    "image1Id" TEXT NOT NULL,
    "image2Id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    CONSTRAINT "Duel_image1Id_fkey" FOREIGN KEY ("image1Id") REFERENCES "Image" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Duel_image2Id_fkey" FOREIGN KEY ("image2Id") REFERENCES "Image" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Duel_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
