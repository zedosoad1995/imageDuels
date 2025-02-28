CREATE TRIGGER update_version
BEFORE UPDATE ON Image
FOR EACH ROW
WHEN OLD.version = NEW.version
BEGIN
    UPDATE Image
    SET version = OLD.version + 1
    WHERE id = OLD.id;
END;