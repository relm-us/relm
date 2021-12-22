import { db, sql, raw } from "./db";
import { INSERT, UPDATE } from "pg-sql-helpers";

import { getDefinedKeys, nullOr } from "../utils";

/**
 * Metadata about a yjs document. Stores the datetime it was created so we can
 * sort in order from most recent to least recent. Also stores the type of doc,
 * e.g. `permanent`, or `transient`.
 */

type DocColumns = {
  doc_id: string;
  doc_type: string;
  relm_id: string;
  entities_count: number;
  assets_count: number;
  created_at: string;
  updated_at: Date;
};

const mkDoc = nullOr((cols: DocColumns) => {
  return {
    docId: cols.doc_id,
    docType: cols.doc_type,
    relmId: cols.relm_id,
    entitiesCount: cols.entities_count,
    assetsCount: cols.assets_count,
    createdAt: cols.created_at,
    updatedAt: cols.updated_at,
  };
});

export async function getDoc({ docId }: { docId: string }) {
  return mkDoc(
    await db.oneOrNone(sql`
    SELECT *
    FROM docs
    WHERE doc_id = ${docId}
  `)
  );
}

/**
 * @param {UUID} docId - the UUID of the yjs document and primary key of this db row
 * @param {string} docType - the type of the Doc, e.g. `permanent`, or `transient`
 * @param {UUID} relmId - the UUID of the relm to which the Doc belongs
 */
export async function setDoc({
  docId,
  docType = "permanent",
  relmId,
}: {
  docId?: string;
  docType?: string;
  relmId: string;
}) {
  const attrs: any = {
    relm_id: relmId,
  };
  if (docId) {
    attrs.doc_id = docId;
  }
  if (docType) {
    attrs.doc_type = docType;
  }
  return mkDoc(
    await db.one(sql`
      ${INSERT("docs", attrs)}
      ON CONFLICT(doc_id)
      DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP,
        relm_id = ${relmId}
      RETURNING *
    `)
  );
}

export async function updateStats({
  docId,
  entitiesCount,
  assetsCount,
}: {
  docId: string;
  entitiesCount?: number;
  assetsCount?: number;
}) {
  const attrs = {
    entities_count: entitiesCount,
    assets_count: assetsCount,
    updated_at: raw("CURRENT_TIMESTAMP"),
  };
  if (entitiesCount !== undefined) attrs.entities_count = entitiesCount;
  if (assetsCount !== undefined) attrs.assets_count = assetsCount;

  if (getDefinedKeys(attrs).length > 0) {
    const row = await db.oneOrNone(sql`
      ${UPDATE("docs", attrs)}
      WHERE doc_id = ${docId}
      RETURNING *
    `);

    if (row !== null) {
      return mkDoc(row);
    } else {
      return null;
    }
  }
}

export async function getLatestDocs({ relmId }: { relmId: string }) {
  const docs: any = {};
  const rows = await db.manyOrNone(sql`
    SELECT DISTINCT ON (doc_type) *
    FROM docs
    WHERE relm_id = ${relmId}
    ORDER BY doc_type, updated_at DESC
  `);
  rows.forEach((row) => {
    const doc = mkDoc(row);
    docs[doc.docType] = doc;
  });
  return docs;
}

/**
 * For testing purposes, provide a way to directly set the timestamp
 */
export async function setUpdatedAt({
  docId,
  updatedAt,
}: {
  docId: string;
  updatedAt: Date;
}) {
  return mkDoc(
    await db.oneOrNone(sql`
    ${UPDATE("docs", { updated_at: updatedAt })}
    WHERE doc_id = ${docId}
    RETURNING *
  `)
  );
}
