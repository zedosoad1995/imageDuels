--duels
CREATE INDEX IF NOT EXISTS duels_image1_id_ix ON duels (image1_id);
CREATE INDEX IF NOT EXISTS duels_image2_id_ix ON duels (image2_id);
CREATE INDEX IF NOT EXISTS duels_voter_id_ix ON duels (voter_id);

--images
CREATE INDEX IF NOT EXISTS images_collection_rating_desc_id_asc_ix ON images (collection_id, rating DESC, id DESC);

--collections
CREATE INDEX IF NOT EXISTS collections_owner_id_ix ON collections (owner_id);
CREATE INDEX IF NOT EXISTS collections_search_tsv_gin_ix ON collections USING GIN (search_tsv);
CREATE INDEX IF NOT EXISTS collections_created_at_id_ix ON collections (created_at, id);
CREATE INDEX IF NOT EXISTS collections_num_votes_id_ix ON collections (num_votes, id);

--user_votes
CREATE INDEX IF NOT EXISTS user_votes_image_id_ix ON user_votes (image_id);

--users
CREATE INDEX IF NOT EXISTS users_email_ix ON users (email);
CREATE INDEX IF NOT EXISTS users_username_ix ON users (username);