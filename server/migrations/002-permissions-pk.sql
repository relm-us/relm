ALTER TABLE permissions
ADD COLUMN permission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4();

CREATE INDEX ON permissions (relm_id, player_id);