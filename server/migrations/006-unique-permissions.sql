ALTER TABLE permissions
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE
DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE permissions
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE
DEFAULT CURRENT_TIMESTAMP;

-- Delete permissions of lesser size
DELETE FROM permissions a
WHERE EXISTS (
  SELECT 1 FROM permissions b
  WHERE jsonb_array_length(a.permits) < jsonb_array_length(b.permits)
    AND ((a.relm_id IS NULL AND b.relm_id IS NULL) OR a.relm_id = b.relm_id)
    AND a.player_id = b.player_id
);

-- Delete duplicate permissions
DELETE FROM permissions a
WHERE EXISTS (
  SELECT 1 FROM permissions b
  WHERE a.permission_id < b.permission_id
    AND ((a.relm_id IS NULL AND b.relm_id IS NULL) OR a.relm_id = b.relm_id)
    AND a.player_id = b.player_id
);

-- Replace existing index with UNIQUE index
DROP INDEX permissions_relm_id_player_id_idx;
CREATE UNIQUE INDEX ON permissions (relm_id, player_id);
