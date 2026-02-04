-- CreateEnum
CREATE TYPE "CollectionModeEnum" AS ENUM ('PERSONAL', 'PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "DuelOutcomeEnum" AS ENUM ('WIN', 'LOSS');

-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('ADMIN', 'REGULAR');

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "question" TEXT,
    "mode" "CollectionModeEnum" NOT NULL,
    "is_nsfw" BOOLEAN NOT NULL DEFAULT false,
    "is_live" BOOLEAN NOT NULL DEFAULT true,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "num_images" INTEGER NOT NULL DEFAULT 0,
    "num_votes" INTEGER NOT NULL DEFAULT 0,
    "search_tsv" tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', coalesce("title",'') ), 'A') ||
        setweight(to_tsvector('simple', coalesce("question",'') ), 'B') ||
        setweight(to_tsvector('simple', coalesce("description",'') ), 'B')
    ) STORED,
    "max_user_votes_per_image" INTEGER,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duels" (
    "id" TEXT NOT NULL,
    "outcome" "DuelOutcomeEnum" NOT NULL,
    "image1_id" TEXT NOT NULL,
    "image2_id" TEXT NOT NULL,
    "voter_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "filepath" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "rating_deviation" DOUBLE PRECISION NOT NULL,
    "volatility" DOUBLE PRECISION NOT NULL,
    "num_votes" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collection_id" TEXT NOT NULL,
    "last_vote_at" TIMESTAMP(3),
    "available_formats" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "available_widths" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "has_placeholder" BOOLEAN NOT NULL DEFAULT false,
    "is_svg" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_votes" (
    "id" TEXT NOT NULL,
    "image_id" TEXT NOT NULL,
    "voter_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "num_votes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "google_id" TEXT,
    "role" "RoleEnum" NOT NULL DEFAULT 'REGULAR',
    "can_see_nsfw" BOOLEAN NOT NULL DEFAULT false,
    "is_profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "images_collection_id_idx" ON "images"("collection_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username" ASC);

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duels" ADD CONSTRAINT "duels_image1_id_fkey" FOREIGN KEY ("image1_id") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duels" ADD CONSTRAINT "duels_image2_id_fkey" FOREIGN KEY ("image2_id") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duels" ADD CONSTRAINT "duels_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_votes" ADD CONSTRAINT "user_votes_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_votes" ADD CONSTRAINT "user_votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

