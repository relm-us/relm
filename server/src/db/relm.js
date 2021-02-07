const { INSERT, UPDATE, WHERE } = require('pg-sql-helpers')

const { db, sql } = require('./db.js')
const { req, getDefinedKeys, nullOr } = require('../util.js')
const Doc = require('./doc.js')

const mkRelm = nullOr(
  ({
    relm_id = req`relm_id`,
    relm_name = req`relm_name`,
    is_public = req`is_public`,
    default_entryway_id,
    created_by,
    created_at = req`created_at`,
  }) => {
    return {
      relmId: relm_id,
      relmName: relm_name,
      isPublic: is_public,
      defaultEntrywayId: default_entryway_id || null,
      createdBy: created_by || null,
      createdAt: created_at,
    }
  }
)

const mkRelmSummary = nullOr(
  ({
    relm_id = req`relm_id`,
    relm_name = req`relm_name`,
    is_public = req`is_public`,
    default_entryway_id,
    created_at = req`created_at`,
  }) => {
    return {
      relmId: relm_id,
      relmName: relm_name,
      isPublic: is_public,
      defaultEntrywayId: default_entryway_id || null,
      createdAt: created_at,
    }
  }
)

async function addLatestDocs(relm) {
  if (relm === null) {
    return null
  }

  const docs = await Doc.getLatestDocs({ relmId: relm.relmId })

  if (docs.transient) {
    relm.transientDocId = docs.transient.docId
  }
  if (docs.permanent) {
    relm.permanentDocId = docs.permanent.docId
  }

  return relm
}

const Relm = (module.exports = {
  getRelm: async ({ relmId, relmName }) => {
    const filter = {}
    if (relmId) {
      filter.relm_id = relmId
    }
    if (relmName) {
      filter.relm_name = relmName
    }

    return await addLatestDocs(
      mkRelm(
        await db.oneOrNone(sql`
          SELECT *
          FROM relms
          ${WHERE(filter)}
        `)
      )
    )
  },

  getAllRelms: async ({ prefix, isPublic = true }) => {
    const filter = {
      is_public: isPublic,
    }
    if (prefix) {
      filter.relm_name = { like: `${prefix}%` }
    }
    return (
      await db.manyOrNone(sql`
        SELECT * FROM relms
        ${WHERE(filter)}
      `)
    ).map((row) => mkRelmSummary(row))
  },

  deleteRelm: async ({ relmId = req`relmId` }) => {
    await db.none(sql`
      DELETE FROM relms
      WHERE relm_id = ${relmId}
    `)
    return true
  },

  createRelm: async ({
    relmId,
    relmName = req`relmName`,
    isPublic,
    defaultEntrywayId,
    createdBy,
  }) => {
    const attrs = {
      relm_name: relmName,
    }
    if (relmId !== undefined) attrs.relm_id = relmId
    if (isPublic !== undefined) attrs.is_public = isPublic
    if (defaultEntrywayId !== undefined)
      attrs.default_entryway_id = defaultEntrywayId
    if (createdBy !== undefined) attrs.created_by = createdBy

    const row = await db.oneOrNone(sql`
      ${INSERT('relms', attrs)}
      RETURNING *
    `)
    if (row !== null) {
      const relm = mkRelm(row)

      relm.transientDocId = (
        await Doc.setDoc({
          docType: 'transient',
          relmId: relm.relmId,
        })
      ).docId

      relm.permanentDocId = (
        await Doc.setDoc({
          docType: 'permanent',
          relmId: relm.relmId,
        })
      ).docId

      return relm
    } else {
      return null
    }
  },

  updateRelm: async ({
    relmId = req`relmId`,
    relmName,
    isPublic,
    defaultEntrywayId,
  }) => {
    const attrs = {}
    if (relmName !== undefined) attrs.relm_name = relmName
    if (isPublic !== undefined) attrs.is_public = isPublic
    if (defaultEntrywayId !== undefined)
      attrs.default_entryway_id = defaultEntrywayId

    if (getDefinedKeys(attrs).length > 0) {
      const row = await db.oneOrNone(sql`
        ${UPDATE('relms', attrs)}
        WHERE relm_id = ${relmId}
        RETURNING *
      `)

      if (row !== null) {
        return await addLatestDocs(mkRelm(row))
      } else {
        return null
      }
    } else {
      return Relm.getRelm({ relmId })
    }
  },
})
