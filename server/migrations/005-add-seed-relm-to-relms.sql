-- A 'seed_relm_id' indicates that if the relm doc is found empty, it should be
-- populated with a copy of the relm pointed to by seed_relm_id.
ALTER TABLE relms ADD COLUMN seed_relm_id UUID;
