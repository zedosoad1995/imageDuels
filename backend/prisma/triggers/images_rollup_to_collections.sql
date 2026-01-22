CREATE OR REPLACE FUNCTION trg_images_rollup_to_collections()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  old_votes int := OLD.num_votes;
  new_votes int := NEW.num_votes;
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collections
    SET num_images = num_images + 1,
        num_votes  = num_votes  + new_votes
    WHERE id = NEW.collection_id;

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collections
    SET num_images = num_images - 1,
        num_votes  = num_votes  - old_votes
    WHERE id = OLD.collection_id;

    RETURN OLD;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Case A: moved to another collection
    IF NEW.collection_id IS DISTINCT FROM OLD.collection_id THEN
      -- decrement old collection
      UPDATE collections
      SET num_images = num_images - 1,
          num_votes  = num_votes  - old_votes
      WHERE id = OLD.collection_id;

      -- increment new collection
      UPDATE collections
      SET num_images = num_images + 1,
          num_votes  = num_votes  + new_votes
      WHERE id = NEW.collection_id;

      RETURN NEW;
    END IF;

    -- Case B: same collection, votes changed
    IF NEW.num_votes IS DISTINCT FROM OLD.num_votes THEN
      UPDATE collections
      SET num_votes = num_votes + (new_votes - old_votes)
      WHERE id = NEW.collection_id;
    END IF;

    RETURN NEW;
  END IF;

  -- Should never hit
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS images_rollup_ins ON images;
DROP TRIGGER IF EXISTS images_rollup_del ON images;
DROP TRIGGER IF EXISTS images_rollup_upd ON images;

-- create triggers
CREATE TRIGGER images_rollup_ins
AFTER INSERT ON images
FOR EACH ROW
EXECUTE FUNCTION trg_images_rollup_to_collections();

CREATE TRIGGER images_rollup_del
AFTER DELETE ON images
FOR EACH ROW
EXECUTE FUNCTION trg_images_rollup_to_collections();

CREATE TRIGGER images_rollup_upd
AFTER UPDATE OF collection_id, num_votes ON images
FOR EACH ROW
EXECUTE FUNCTION trg_images_rollup_to_collections();
