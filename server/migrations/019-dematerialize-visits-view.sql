-- Rather than calling REFRESH MATERIALIZED VIEW all the time, let's
-- use a regular view instead

DROP MATERIALIZED VIEW visits_most_recent;

CREATE VIEW visits_most_recent AS
SELECT
  v.relm_id,
  p.user_id,
  max(v.created_at) as created_at
FROM visits v
LEFT JOIN participants p USING (participant_id)
WHERE p.user_id IS NOT NULL
GROUP BY v.relm_id, p.user_id;
