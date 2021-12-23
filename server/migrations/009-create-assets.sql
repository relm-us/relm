CREATE TABLE assets (
  asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  relm_id UUID,
  name TEXT,
  description TEXT,
  tags JSONB,
  ecs_properties JSONB,
  thumbnail TEXT,
  created_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX assets_name_idx ON assets
USING GIN (to_tsvector('english', name));

CREATE INDEX assets_description_idx ON assets
USING GIN (to_tsvector('english', description));
