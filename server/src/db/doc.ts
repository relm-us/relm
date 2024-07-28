import { db, sql, raw } from "./db.js";
import { INSERT, UPDATE } from "./pgSqlHelpers.js";

import { getDefinedKeys, nullOr } from "../utils/index.js";

/**
 * Metadata about a yjs document. Stores the datetime it was created so we can
 * sort in order from most recent to least recent. Also stores the type of doc,
 * e.g. `permanent`, or `transient`.
 */

type CreateDocData = {
  doc_id: string;
  doc_type: string;
  relm_id: string;
  entities_count: number;
  assets_count: number;
  portals: string[];
  created_at: Date;
  updated_at: Date;
};

export type RelmDoc = {
  docId: string;
  docType: "permanent" | "transient";
  relmId: string;
  entitiesCount: number;
  assetsCount: number;
  portals: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type RelmDocWithName = RelmDoc & { relmName: string };

const mkDoc = nullOr((cols: CreateDocData): RelmDoc => {
  return {
    docId: cols.doc_id,
    docType: cols.doc_type === "permanent" ? "permanent" : "transient",
    relmId: cols.relm_id,
    entitiesCount: cols.entities_count,
    assetsCount: cols.assets_count,
    portals: cols.portals,
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
  `),
  );
}

export async function getDocWithRelmName({ docId }: { docId: string }): Promise<RelmDocWithName> {
  const rows = await db.oneOrNone(sql`
    SELECT docs.*, r.relm_name
      FROM docs
      JOIN relms r USING (relm_id)
     WHERE doc_id = ${docId}
  `);

  if (rows) {
    return {
      ...mkDoc(rows),
      relmName: rows.relm_name,
    };
  } else {
    return null;
  }
}

// Given a docId, find the associated relm, and then find that relm's
// "seed relm". If the "seed relm" exists, return its docId (e.g. probably
// so we can clone it)
export async function getSeedDocId({ docId }: { docId: string }): Promise<string> {
  const row = await db.oneOrNone(
    sql`
    SELECT d2.doc_id
      FROM relms r1
      JOIN docs d1 ON (d1.relm_id = r1.relm_id)
      JOIN relms r2 ON (r2.relm_id = r1.seed_relm_id)
      JOIN docs d2 ON (d2.relm_id = r2.relm_id AND d2.doc_type = 'permanent')
     WHERE d1.doc_id = ${docId}
  `,
  );
  if (row) {
    return row.doc_id;
  } else {
    return null;
  }
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
    entities_count: 1,
    assets_count: 1,
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
    `),
  );
}

export async function updateStats({
  docId,
  entitiesCount,
  assetsCount,
  portals,
}: {
  docId: string;
  entitiesCount?: number;
  assetsCount?: number;
  portals?: string[];
}) {
  const attrs = {
    entities_count: entitiesCount ?? 0,
    assets_count: assetsCount ?? 0,
    portals: JSON.stringify(portals ?? []),
    updated_at: raw("CURRENT_TIMESTAMP"),
  };

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
export async function setUpdatedAt({ docId, updatedAt }: { docId: string; updatedAt: Date }) {
  return mkDoc(
    await db.oneOrNone(sql`
    ${UPDATE("docs", { updated_at: updatedAt })}
    WHERE doc_id = ${docId}
    RETURNING *
  `),
  );
}
