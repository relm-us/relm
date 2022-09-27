-- Allow docs to cache remote portals
ALTER TABLE docs ADD COLUMN portals JSONB DEFAULT '[]';
