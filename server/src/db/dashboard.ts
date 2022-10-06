import { db, sql } from "./db.js";

export async function getDashboardRelms(userId: string) {
  return await db.manyOrNone(sql`
    SELECT r.relm_name, v.created_at as last_visited_at, inv_u.email AS invited_by_email, inv_u.identity_data->'name' AS invited_by_name
    FROM relms r
    JOIN visits_most_recent v USING (relm_id)
    JOIN participants p USING (participant_id)
    LEFT JOIN permissions pm USING (relm_id, participant_id)
    LEFT JOIN invitation_uses iu ON iu.relm_id = r.relm_id AND iu.used_by = p.participant_id
    LEFT JOIN invitations i ON i.token = iu.token AND i.relm_id = r.relm_id
    LEFT JOIN participants inv_p ON inv_p.participant_id = i.created_by
    LEFT JOIN users inv_u ON inv_u.user_id = inv_p.user_id
    WHERE p.user_id = ${userId}
      AND (r.public_permits->'access' = 'true'
        OR r.public_permits->'admin' = 'true'
        OR pm.permits->'access' = 'true'
        OR pm.permits->'admin' = 'true')
  `);
}
