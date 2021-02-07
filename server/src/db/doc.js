const { db, sql } = require('./db.js')
const { INSERT, UPDATE } = require('pg-sql-helpers')

const { req, nullOr } = require('../util.js')

const mkDoc = nullOr(
  ({
    doc_id = req`doc_id`,
    doc_type = req`doc_type`,
    relm_id = req`relm_id`,
    created_at = req`created_at`,
    updated_at = req`updated_at`,
  }) => {
    return {
      docId: doc_id,
      docType: doc_type,
      relmId: relm_id,
      createdAt: created_at,
      updatedAt: updated_at,
    }
  }
)

/**
 * Metadata about a yjs document. Stores the datetime it was created so we can
 * sort in order from most recent to least recent. Also stores the type of doc,
 * e.g. `permanent`, or `transient`.
 */
const Doc = (module.exports = {
  /**
   * @param {Client} client - the postgresql db client
   * @param {UUID} docId - the UUID of the yjs document and primary key of this db row
   * @param {string} docType - the type of the Doc, e.g. `permanent`, or `transient`
   * @param {UUID} relmId - the UUID of the relm to which the Doc belongs
   */
  setDoc: async ({ docId, docType = 'permanent', relmId = req`relmId` }) => {
    const attrs = {
      relm_id: relmId,
    }
    if (docId) {
      attrs.doc_id = docId
    }
    if (docType) {
      attrs.doc_type = docType
    }
    return mkDoc(
      await db.one(sql`
      ${INSERT('docs', attrs)}
      ON CONFLICT(doc_id)
      DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP,
        relm_id = ${relmId}
      RETURNING *
    `)
    )
  },

  getDoc: async ({ docId }) => {
    return mkDoc(
      await db.oneOrNone(sql`
      SELECT *
      FROM docs
      WHERE doc_id = ${docId}
    `)
    )
  },

  getLatestDocs: async ({ relmId = req`relmId` }) => {
    const docs = {}
    const rows = await db.manyOrNone(sql`
      SELECT DISTINCT ON (doc_type) *
      FROM docs
      WHERE relm_id = ${relmId}
      ORDER BY doc_type, updated_at DESC
    `)
    rows.forEach((row) => {
      const doc = mkDoc(row)
      docs[doc.docType] = doc
    })
    return docs
  },

  /**
   * For testing purposes, provide a way to directly set the timestamp
   */
  setUpdatedAt: async ({ docId = req`docId`, updatedAt = req`updatedAt` }) => {
    return mkDoc(
      await db.oneOrNone(sql`
      ${UPDATE('docs', { updated_at: updatedAt })}
      WHERE doc_id = ${docId}
      RETURNING *
    `)
    )
  },
})
