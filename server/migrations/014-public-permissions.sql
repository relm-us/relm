-- Add "public_permits" column, in preparation to remove "is_public" column:
ALTER TABLE relms
ADD COLUMN public_permits JSONB DEFAULT '{}'::JSONB;

-- Store meaning of "is_public" in "public_permits"
UPDATE relms
SET public_permits = '{"access": true}'
WHERE is_public = 't';

-- Remove no longer used "is_public" column
ALTER TABLE relms
DROP COLUMN is_public;
