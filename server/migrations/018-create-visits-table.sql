-- Track where participants visit; new entry each time a websocket connection is established
CREATE TABLE visits (
  visit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relm_id UUID NOT NULL,
  participant_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON visits (relm_id, participant_id);

CREATE MATERIALIZED VIEW visits_most_recent AS
SELECT relm_id, participant_id, max(created_at) as created_at
FROM visits
GROUP BY relm_id, participant_id;