-- We use yjs to sync entryways, so no need for this table or column
DROP TABLE entryways;
ALTER TABLE relms DROP COLUMN default_entryway_id;