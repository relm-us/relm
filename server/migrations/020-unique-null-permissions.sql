-- Delete permissions of lesser size
-- NOTE: This MAY escalate privilege for participants with "global" (all-relm) permissions.
--       However, it is a bug that multiple global privileges could exist for a single
--       participant, and we must merge them somehow. Lowering privileges is not an option,
--       as this may lock out the admins.
DELETE FROM permissions a
WHERE EXISTS (
  SELECT 1 FROM permissions b
  WHERE LENGTH(a.permits::text) < LENGTH(b.permits::text)
    AND (a.relm_id IS NULL AND b.relm_id IS NULL)
    AND a.participant_id = b.participant_id
);

-- Delete duplicate permissions
DELETE FROM permissions a
WHERE EXISTS (
  SELECT 1 FROM permissions b
  WHERE a.permission_id < b.permission_id
    AND (a.relm_id IS NULL AND b.relm_id IS NULL)
    AND a.participant_id = b.participant_id
);

-- Replace existing index with UNIQUE and UNIQUE for NULL indices
DROP INDEX permissions_relm_id_player_id_idx;
CREATE UNIQUE INDEX permissions_relm_id_participant_id_idx
  ON permissions (relm_id, participant_id) WHERE relm_id IS NOT NULL;
CREATE UNIQUE INDEX permissions_null_relm_id_participant_id_idx
  ON permissions ((relm_id IS NULL), participant_id) WHERE relm_id IS NULL;
