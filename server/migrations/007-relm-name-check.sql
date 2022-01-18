-- Add constraint that prevents relm names from being set to '*'
ALTER TABLE relms 
ADD CHECK (relm_name <> '*');
