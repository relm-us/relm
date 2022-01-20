import { db, sql, INSERT, IN, raw } from "./db";
import * as set from "../utils/set";
import { arrayToBooleanObject } from "../utils";

export type Permission = "admin" | "access" | "invite" | "edit";

export function filteredPermits(permits) {
  const acceptable = new Set(["admin", "access", "invite", "edit"]);
  return new Set(permits.filter((permit) => acceptable.has(permit)));
}

/**
 * @param {UUID} playerId - the UUID of the player to set permissions for
 * @param {string} relm - the relm to which the permissions pertain, or '*' if for all relms
 * @param {Array<PERMISSIONS>} permits - an array-like containing a list of permissions, e.g. PERMISSIONS.ACCESS
 */
export async function setPermissions({
  playerId,
  relmId,
  permits = ["access"],
  union = true,
}: {
  playerId: string;
  relmId?: string;
  permits?: Array<Permission>;
  union?: boolean;
}) {
  const attrs = {
    relm_id: relmId,
    player_id: playerId,
    permits: JSON.stringify(arrayToBooleanObject(permits)),
  };

  let row;
  if (union) {
    row = await db.one(sql`
      ${INSERT("permissions", attrs)}
      ON CONFLICT(relm_id, player_id)
      DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP,
        permits = (permissions.permits || ${attrs.permits})::jsonb
      RETURNING permits
    `);
  } else {
    row = await db.one(sql`
      ${INSERT("permissions", attrs)}
      ON CONFLICT(relm_id, player_id)
      DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP,
        permits = ${attrs.permits}
      RETURNING permits
    `);
  }

  return new Set(Object.keys(row.permits));
}

export async function getPermissions({
  playerId,
  relmNames,
  relmIds,
}: {
  playerId: string;
  relmNames?: string[];
  relmIds?: string[];
}): Promise<Record<string, string[]>> {
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

  let permitsByRelm: Map<string, Set<string>> = new Map(
    rows.map((row) => [row.relm, new Set()])
  );

  // For each relm, add permits that have been granted to the playerId
  for (const row of rows) {
    const permits = permitsByRelm.get(row.relm);
    for (const permit in row.permits) {
      if (row.permits[permit]) {
        permits.add(permit);
      }
    }
  }

  const wildcardPermits = permitsByRelm.get("*") || new Set();

  // Convert Map<string, Set> to Record<string, Array>, adding wildcard permits, if any:
  let result = Object.create(null);
  if (permitsByRelm.has("*")) result["*"] = [...permitsByRelm.get("*")];
  for (let relm of relms) {
    result[relm] = [...set.union(permitsByRelm.get(relm), wildcardPermits)];
  }

  return result;
}

function empty(arr) {
  return !arr || arr.length == 0;
}
