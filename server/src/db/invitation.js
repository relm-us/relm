const { INSERT, UPDATE } = require('pg-sql-helpers')

const { db, sql } = require('./db.js')
const util = require('../util.js')
const Permission = require('./permission.js')

function randomToken() {
  return util.uuidv4().split('-')[0]
}

function mkInvitation(json) {
  return {
    token: json.token,
    relmId: json.relm_id,
    relmName: json.relm_name,
    permits: new Set(json.permits),
    used: json.used,
    maxUses: json.max_uses,
    createdAt: json.created_at,
    createdBy: json.created_by,
  }
}

const database = db

const Invitation = {
  toJSON: (invitation) => {
    return Object.assign({}, invitation, { permits: [...invitation.permits] })
  },

  createInvitation: async (
    {
      token = randomToken(),
      relmId,
      maxUses = 1,
      permits = [Permission.ACCESS],
      createdBy = null,
    },
    db = database
  ) => {
    const attrs = {
      token: token,
      relm_id: relmId,
      max_uses: maxUses,
      permits: JSON.stringify(permits),
      created_by: createdBy,
    }
    return mkInvitation(
      await db.one(sql`
        ${INSERT('invitations', attrs)}
        RETURNING *
      `)
    )
  },

  getInvitation: async ({ token, relmId }, db = database) => {
    const row = await db.oneOrNone(sql`
      SELECT i.*, r.relm_name
      FROM invitations i
      LEFT JOIN relms r USING (relm_id)
      WHERE token = ${token}
    `)

    if (row === null) {
      return null
    } else {
      if (relmId) {
        const invitationRelmId = row.relm_id
        if (invitationRelmId === relmId || invitationRelmId === null) {
          return mkInvitation(row)
        } else {
          throw Error(
            `token not valid for relm '${row.relm_name}' ('${invitationRelmId}')`
          )
        }
      } else {
        return mkInvitation(row)
      }
    }
  },

  useInvitation: async ({ token, relmId, playerId }, db = database) => {
    return await db.task('useInvitation', async (task) => {
      const invite = await Invitation.getInvitation({ token, relmId }, task)

      if (invite) {
        if (invite.used < invite.maxUses) {
          await db.tx((t) => {
            const queries = []

            queries.push(
              t.none(sql`
              ${UPDATE('invitations', { used: invite.used + 1 })}
              WHERE token = ${token}
            `)
            )

            if (playerId) {
              const attrs = {
                token,
                used_by: playerId,
                relm_id: relmId,
              }
              queries.push(
                t.none(sql`
                ${INSERT('invitation_uses', attrs)}
              `)
              )
            }

            return t.batch(queries)
          })

          return Object.assign(invite, { used: invite.used + 1 })
        } else {
          throw Error('invitation no longer valid')
        }
      } else {
        throw Error('invitation not found')
      }
    })
  },
}

module.exports = Invitation
