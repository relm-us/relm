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
  // First SELECT:
  //  - get access permission for public relms
  //
  // Second SELECT:
  //  - get various permissions for player in relms
  const rows = await db.manyOrNone(sql`
      SELECT
        r.relm_${raw(relmNames ? "name" : "id")} AS relm,
        '["access"]'::jsonb AS permits
      FROM relms r
      WHERE r.is_public = 't'
        AND r.relm_${raw(relmNames ? "name" : "id")} ${IN(relms)}

      UNION

      SELECT
        r.relm_${raw(relmNames ? "name" : "id")} AS relm,
        p.permits
      FROM permissions AS p
      LEFT JOIN relms AS r USING (relm_id)
      WHERE p.player_id = ${playerId}
        AND (
          r.relm_id IS NULL OR
          r.relm_${raw(relmNames ? "name" : "id")} ${IN(relms)}
        )
  `);

  // Admins can have permission for "all relms", which is designated
  // by a NULL value as the relm_id. Collect up any wildcard permissions
  // and remove them for the next step.
  let wildcardPermits: Set<string> = new Set();
  for (let i = rows.length - 1; i >= 0; i--) {
    if (!rows[i].relm) {
      const row = rows.splice(i, 1)[0];
      const _permits = new Set<string>(row.permits);
      wildcardPermits = set.union(wildcardPermits, _permits);
    }
  }

  // Each relm's permission starts out blank; however, if there is a
  // wildcard permit, starts out with the designated wildcard permission
  // set.
  let permitsByRelm: Map<string, Set<string>> = new Map(
    relms.map((id) => [id, new Set(wildcardPermits)])
  );
  permitsByRelm.set("*", new Set(wildcardPermits));

  // For each relm, add permits that have been granted to the playerId
  for (const row of rows) {
    const permits = permitsByRelm.get(row.relm);
    for (const permit of row.permits) {
      permits.add(permit);
    }
  }

  // Convert Map<string, Set> to Record<string, Array>:
  let result = Object.create(null);
  for (let [k, v] of permitsByRelm) {
    result[k] = [...v];
  }
  return result;
}

function empty(arr) {
  return !arr || arr.length == 0;
}
