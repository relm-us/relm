import { db, sql, INSERT, IN, raw } from "./db.js";
import { arrayToBooleanObject, booleanObjectToArray } from "../utils/index.js";
import { getRelm } from "./relm.js";

const PERMISSIONS = ["read", "access", "edit", "invite", "admin"];
export type Permission = "read" | "access" | "edit" | "invite" | "admin";
export type Permits = {
  read?: boolean;
  admin?: boolean;
  access?: boolean;
  invite?: boolean;
  edit?: boolean;
};

export type UUID = string;

export function validPermission(permission) {
  return PERMISSIONS.includes(permission);
}

export function filteredPermits(permits) {
  return new Set(permits.filter((permission) => validPermission(permission)));
}

/**
 * @param {UUID} participantId - the UUID of the participant to set permissions for
 * @param {string} relm - the relm to which the permissions pertain, or '*' if for all relms
 * @param {Array<PERMISSIONS>} permits - an array-like containing a list of permissions, e.g. PERMISSIONS.ACCESS
 */
export async function setPermits({
  participantId,
  permits,
  relmId,
  relmName,
  union = true,
}: {
  participantId: string;
  permits: Array<Permission>;
  relmId?: "*" | UUID;
  relmName?: string;
  union?: boolean;
}) {
  let relm_id;

  if (relmId === "*") {
    // special case: set permission on all relms
    relm_id = null;
  } else if (relmId) {
    const relm = await getRelm({ relmId });
    if (relm) relm_id = relmId;
    else throw Error(`relm ID not found: ${relmId}`);
  } else if (relmName) {
    const relm = await getRelm({ relmName });
    if (relm) relm_id = relm.relmId;
    else throw Error(`relm not found: ${relmName}`);
  }

  const attrs = {
    relm_id,
    participant_id: participantId,
    permits: JSON.stringify(arrayToBooleanObject(permits)),
  };

  if (union) {
    await db.one(sql`
      ${INSERT("permissions", attrs)}
      ON CONFLICT(relm_id, participant_id)
      DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP,
        permits = (permissions.permits || ${attrs.permits})::jsonb
      RETURNING permits
    `);
  } else {
    await db.one(sql`
      ${INSERT("permissions", attrs)}
      ON CONFLICT(relm_id, participant_id)
      DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP,
        permits = ${attrs.permits}
      RETURNING permits
    `);
  }
}

export async function getPermissions({
  participantId,
  relmNames,
  relmIds,
}: {
  participantId: UUID;
  relmNames?: string[];
  relmIds?: UUID[];
}): Promise<Record<string, Permission[]>> {
  if (empty(relmNames) && empty(relmIds)) return {};

  const relms = relmNames ? relmNames : relmIds;
  const rows = await db.manyOrNone(sql`
      --
      -- Gather all participant ids belonging to the user
      --
      WITH puid AS (
        SELECT user_id FROM participants WHERE participant_id=${participantId}
      ), user_participant_ids AS (
        SELECT participant_id FROM participants WHERE user_id=(SELECT user_id FROM puid)
          GROUP BY participants.participant_id HAVING COUNT((SELECT user_id FROM puid)) > 0
      )
      --
      -- Check for wildcard permission (e.g. admin)
      --
      SELECT '*' AS relm, p.permits
      FROM permissions p
      WHERE (
          p.participant_id = ${participantId} OR p.participant_id IN (
            SELECT participant_id FROM user_participant_ids
          )
        )
        AND p.relm_id IS NULL

      UNION

      --
      -- Check for specific access to a relm (public or private)
      --
      SELECT
        r.relm_${raw(relmNames ? "name" : "id")}::text AS relm,
        COALESCE(p.permits, '{}'::JSONB) || r.public_permits AS permits
      FROM relms AS r
      LEFT JOIN (
        SELECT * FROM permissions
        WHERE (
          participant_id = ${participantId} OR participant_id IN (
            SELECT participant_id FROM user_participant_ids
          )
        )
      ) p USING (relm_id)
      WHERE r.relm_${raw(relmNames ? "name" : "id")} ${IN(relms)}
  `);

  let permitsByRelm: Record<string, Permission[]> = {};
  for (const relm of relms) {
    permitsByRelm[relm] = [];
  }
  for (const row of rows) {
    permitsByRelm[row.relm] = booleanObjectToArray(row.permits) as Permission[];
  }

  return permitsByRelm;
}

function empty(arr) {
  return !arr || arr.length == 0;
}
