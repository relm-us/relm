-- Let's be consistent about how we name things; `players` has been deprecated for some time
ALTER TABLE players RENAME TO participants;

-- Update tables with reference to `player_id`
ALTER TABLE participants RENAME COLUMN player_id TO participant_id;
ALTER TABLE permissions RENAME COLUMN player_id TO participant_id;
