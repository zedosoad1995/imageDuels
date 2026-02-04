ALTER TABLE user_votes
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE users
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE images
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE collections
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE duels
ALTER COLUMN id SET DEFAULT gen_random_uuid();