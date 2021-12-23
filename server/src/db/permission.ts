import { db, sql, VALUES, INSERT, IN, raw } from "./db";
import * as set from "../utils/set";

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
}: {
  playerId: string;
  relmId?: string;
  permits?: Array<Permission>;
}) {
  const attrs = {
    relm_id: relmId,
    player_id: playerId,
    permits: JSON.stringify([...permits]),
  };
  const row = await db.one(sql`
      ${INSERT("permissions", attrs)}
      RETURNING permits
    `);

  return new Set(row.permits);
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
  // TODO: add CHECK relm_name <> '*' in table defn
  const rows = await db.manyOrNone(sql`
      --
      -- Get wildcard access (e.g. admin) for all relms, if granted
      --
      SELECT '*' AS relm, p.permits
      FROM permissions p
      WHERE p.player_id = ${playerId}
        AND p.relm_id IS NULL

      UNION

      --
      -- Get access permission for public relms
      --
      SELECT
        r.relm_${raw(relmNames ? "name" : "id")} AS relm,
        '["access"]'::jsonb AS permits
      FROM relms r
      WHERE r.is_public = 't'
        AND r.relm_${raw(relmNames ? "name" : "id")} ${IN(relms)}

      UNION

      --
      -- Get various permissions for player in private relms
      --
      SELECT
        r.relm_${raw(relmNames ? "name" : "id")} AS relm,
        p.permits
      FROM relms AS r
      LEFT JOIN permissions AS p USING (relm_id)
      WHERE r.is_public = 'f'
        AND p.player_id = ${playerId}
        AND r.relm_${raw(relmNames ? "name" : "id")} ${IN(relms)}
  `);

  // Each relm's permission starts out blank; however, if there is a
  // wildcard permit, starts out with the designated wildcard permission
  // set.
  let permitsByRelm: Map<string, Set<string>> = new Map(
    rows.map((row) => [row.relm, new Set()])
  );

  // For each relm, add permits that have been granted to the playerId
  for (const row of rows) {
    const permits = permitsByRelm.get(row.relm);
    for (const permit of row.permits) {
      permits.add(permit);
    }
  }

  const wildcardPermits = permitsByRelm.get("*") || new Set();

  // Convert Map<string, Set> to Record<string, Array>:
  let result = Object.create(null);
  for (let [k, v] of permitsByRelm) {
    result[k] = [...set.union(v, wildcardPermits)];
  }
  return result;
}

function empty(arr) {
  return !arr || arr.length == 0;
}
