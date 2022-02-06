CREATE TABLE variables (
  relm_id UUID,
  variable_name TEXT,
  description TEXT,
  value_str TEXT,
  value_num NUMERIC(12, 4),
  created_by UUID NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (relm_id, variable_name)
);
