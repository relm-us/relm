-- Convert permits from jsonb array to jsonb object, e.g.
-- ["access", "edit"] -> {"access": true, "edit": true}
UPDATE permissions
SET permits =
  REPLACE(REPLACE(
    REGEXP_REPLACE(permits::text, '("[^"]+")', '\1: true', 'g'),
  '[', '{'), ']', '}')::jsonb;
