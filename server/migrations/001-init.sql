CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- A relm (i.e. relm.us/[relm_name])
CREATE TABLE relms (
  relm_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relm_name TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  default_entryway_id UUID,
  created_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(relm_name)
);

-- Y documents representing the state of each relm
CREATE TABLE docs (
  doc_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relm_id UUID NOT NULL,
  doc_type TEXT DEFAULT 'permanent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- An invitation, as an N-use token, to join a relm with certain permissions
CREATE TABLE invitations (
  token TEXT PRIMARY KEY,
  relm_id UUID NULL, -- WARNING: if NULL, the invitation's permits apply to all relms
  used INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 1,
  encrypted_password TEXT NULL, -- if NULL, token is accepted without password
  permits JSONB DEFAULT '["access"]'::JSONB,
  created_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Track when invitations are used, and by whom
CREATE TABLE invitation_uses (
  invitation_use_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT,
  relm_id UUID,
  used_by UUID,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- We model a single human being as a "user"
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- But a user can have many "players", i.e. a browser instance with a unique character
CREATE TABLE players (
  player_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  public_key_doc JSONB UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Join table between relms and players, granting permissions
-- `permits` is an array of strings
CREATE TABLE permissions (
  relm_id UUID,
  player_id UUID,
  permits JSONB
);

-- A location within a relm where players may enter
-- `position` is a JSON object containing x, y, z coordinate
CREATE TABLE entryways (
  entryway_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relm_id UUID,
  entryway TEXT,
  position JSONB,
  created_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add initial setup token
INSERT INTO invitations (token, permits)
VALUES ('setup', '["admin","access","invite","edit"]'::JSONB);

-- Add initial admin relm; access with one-time token above, e.g.:
--   http://localhost:1234/admin?t=setup
WITH rows AS (
  INSERT INTO relms (relm_name)
  VALUES ('admin')
  RETURNING relm_id
)
INSERT INTO docs (relm_id, doc_type)
SELECT relm_id, 'permanent' FROM rows
UNION ALL
SELECT relm_id, 'transient' FROM rows;
