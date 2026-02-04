CREATE UNIQUE INDEX IF NOT EXISTS user_votes_voter_id_image_id_uq
ON user_votes (voter_id, image_id);