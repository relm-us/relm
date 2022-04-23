-- All invitations need a relm_id, but we forgot to set it in 001-init.sql
UPDATE invitations
SET relm_id = (
    SELECT relm_id
    FROM relms
    WHERE relm_name = 'admin'
)
WHERE token = 'setup';
