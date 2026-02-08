BEGIN;

ALTER TABLE "user_votes"
  DROP CONSTRAINT IF EXISTS "user_votes_image_id_fkey";

ALTER TABLE "user_votes"
  ADD CONSTRAINT "user_votes_image_id_fkey"
  FOREIGN KEY ("image_id")
  REFERENCES "images"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

COMMIT;
