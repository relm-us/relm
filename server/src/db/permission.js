const { INSERT } = require('pg-sql-helpers')

const { db, sql } = require('./db.js')
const set = require('../set.js')

const Permission = (module.exports = {
  ADMIN: 'admin',
  ACCESS: 'access',
  INVITE: 'invite',
  EDIT: 'edit',

  filteredPermits: (permits) => {
    const acceptable = new Set([
      Permission.ADMIN,
      Permission.ACCESS,
      Permission.INVITE,
      Permission.EDIT,
    ])
    return new Set(permits.filter((permit) => acceptable.has(permit)))
  },

  /**
   * @param {UUID} playerId - the UUID of the player to set permissions for
   * @param {string} relm - the relm to which the permissions pertain, or '*' if for all relms
   * @param {Array<PERMISSIONS>} permits - an array-like containing a list of permissions, e.g. PERMISSIONS.ACCESS
   */
  setPermissions: async ({
    playerId,
    relmId,
    permits = [Permission.ACCESS],
  }) => {
    const attrs = {
      relm_id: relmId,
      player_id: playerId,
      permits: JSON.stringify([...permits]),
    }
    const row = await db.one(sql`
      ${INSERT('permissions', attrs)}
      RETURNING permits
    `)

    return new Set(row.permits)
  },

  getPermissions: async ({ playerId, relmId }) => {
    const rows = await db.manyOrNone(sql`
      SELECT relm_id, permits
      FROM permissions
      WHERE player_id = ${playerId}
        AND (
          relm_id IS NULL OR relm_id = ${relmId}
        )
    `)

    // union of all permissions
    let permits = new Set()
    for (const row of rows) {
      const _permits = new Set(row.permits)
      permits = set.union(permits, _permits)
    }

    const rows2 = await db.oneOrNone(sql`
      SELECT *
      FROM relms
      WHERE relm_id = ${relmId}
        AND is_public = true
    `)
    if (rows2 !== null) {
      permits.add(Permission.ACCESS)
    }

    return permits
  },
})
