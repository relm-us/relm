-- `clone_permit_required` ensures the participant has permission to clone
-- e.g. if `clone_permit_required` == 'access' then anyone with read access
-- to the relm will be able to clone it.
ALTER TABLE relms ADD COLUMN clone_permit_required TEXT DEFAULT NULL;

-- `clone_permit_assigned` is the permission assigned to the participant
-- who cloned the relm. e.g. if `clone_permit_assigned` == 'edit', then
-- the participant who cloned the relm will have edit (build) permission.
ALTER TABLE relms ADD COLUMN clone_permit_assigned TEXT DEFAULT NULL;
