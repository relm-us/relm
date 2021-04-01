-- We use yjs to sync entryways, so no need for this table or column
ALTER TABLE docs ADD COLUMN entities_count INTEGER DEFAULT 0;
ALTER TABLE docs ADD COLUMN assets_count INTEGER DEFAULT 0;
