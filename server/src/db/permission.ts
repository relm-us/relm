import { db, sql, INSERT, IN, raw } from "./db.js";
import { arrayToBooleanObject, booleanObjectToArray } from "../utils/index.js";
import { getRelm } from "./relm.js";

const PERMISSIONS = ["admin", "access", "invite", "edit"];
export type Permission = "admin" | "access" | "invite" | "edit";

export function validPermission(permission) {
  return PERMISSIONS.includes(permission);
}

export function filteredPermits(permits) {
  return new Set(permits.filter((permission) => validPermission(permission)));
}

/**
 * @param {UUID} playerId - the UUID of the player to set permissions for
 * @param {string} relm - the relm to which the permissions pertain, or '*' if for all relms
 * @param {Array<PERMISSIONS>} permits - an array-like containing a list of permissions, e.g. PERMISSIONS.ACCESS
 */
export async function setPermits({
  playerId,
  relmId,
  relmName,
  permits = ["access"],
  union = true,
}: {
  playerId: string;
  relmId?: string;
  relmName?: string;
  permits?: Array<Permission>;
  union?: boolean;
}): Promise<boolean> {
  let relm_id;

  if (relmId) {
    relm_id = relmId;
  } else if (relmName) {
    const relm = await getRelm({ relmName });
    if (relm) {
      relm_id = relm.relmId;
    } else {
      // Relm does not exist, we won't set permissions on it
      return false;
    }
  } else {
    // special case: set permission on all relms
    relm_id = null;
  }

  const attrs = {
    relm_id,
    player_id: playerId,
    permits: JSON.stringify(arrayToBooleanObject(permits)),
  };

  if (union) {
    await db.one(sql`
      ${INSERT("permissions", attrs)}
      ON CONFLICT(relm_id, player_id)
      DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP,
        permits = (permissions.permits || ${attrs.permits})::jsonb
      RETURNING permits
    `);
  } else {
    await db.one(sql`
      ${INSERT("permissions", attrs)}
      ON CONFLICT(relm_id, player_id)
      DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP,
        permits = ${attrs.permits}
      RETURNING permits
    `);
  }

  return true;
}

export async function getPermissions({
  playerId,
  relmNames,
  relmIds,
}: {
  playerId: string;
  relmNames?: string[];
  relmIds?: string[];
}): Promise<Record<string, Permission[]>> {
  if (empty(relmNames) && empty(relmIds)) return {};

  const relms = relmNames ? relmNames : relmIds;
  const rows = await db.manyOrNone(sql`
      --
      -- Check for wildcard permission (e.g. admin)
      --
      SELECT '*' AS relm, p.permits
      FROM permissions p
      WHERE p.player_id = ${playerId}
        AND p.relm_id IS NULL

      UNION

      --
      -- Check for specific access to a relm (public or private)
      --
      SELECT
        r.relm_${raw(relmNames ? "name" : "id")}::text AS relm,
        CASE
          WHEN p.permits IS NOT NULL THEN p.permits
          WHEN r.is_public = 't' THEN '{"access":true}'::jsonb
          WHEN p.permits IS NULL THEN '{}'::jsonb
        END AS permits
      FROM relms AS r
      LEFT JOIN (
        SELECT * FROM permissions
        WHERE player_id = ${playerId}
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
