CREATE TABLE variables (
  relm_id UUID,
  variable_name TEXT,
  description TEXT,
  -- default is a JSONB 'null', not a SQL NULL:
  value JSONB NOT NULL DEFAULT 'null',
  created_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (relm_id, variable_name)
);
