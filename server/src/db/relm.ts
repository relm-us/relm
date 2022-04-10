import * as Doc from "./doc.js";
import { db, sql, INSERT, UPDATE, WHERE } from "./db.js";
import { getDefinedKeys, nullOr } from "../utils/index.js";

type RelmColumns = {
  relm_id: string;
  relm_name: string;
  seed_relm_id: string;
  is_public: boolean;
  created_by?: string;
  created_at: string;
};

const mkRelm = nullOr((cols: RelmColumns) => {
  return {
    relmId: cols.relm_id,
    relmName: cols.relm_name,
    seedRelmId: cols.seed_relm_id,
    isPublic: cols.is_public,
    createdBy: cols.created_by || null,
    createdAt: cols.created_at,
  };
});

type RelmSummaryColumns = {
  relm_id: string;
  relm_name: string;
  seed_relm_id: string;
  is_public: boolean;
  created_at: string;
  doc_id: string;
  assets_count: number;
  entities_count: number;
};

const mkRelmSummary = nullOr((cols: RelmSummaryColumns) => {
  return {
    relmId: cols.relm_id,
    relmName: cols.relm_name,
    seedRelmId: cols.seed_relm_id,
    isPublic: cols.is_public,
    createdAt: cols.created_at,
    docId: cols.doc_id,
    assetsCount: cols.assets_count,
    entitiesCount: cols.entities_count,
  };
});

async function addLatestDocs(relm) {
  if (relm === null) {
    return null;
  }

  const docs = await Doc.getLatestDocs({ relmId: relm.relmId });

  if (docs.permanent) {
    relm.permanentDocId = docs.permanent.docId;
    relm.entitiesCount = docs.permanent.entitiesCount;
    relm.assetsCount = docs.permanent.assetsCount;
  }

  return relm;
}

export async function getRelm({
  relmId,
  relmName,
}: {
  relmId?: string;
  relmName?: string;
}) {
  const filter: any = {};
  if (relmId) {
    filter.relm_id = relmId;
  }
  if (relmName) {
    filter.relm_name = relmName;
  }

  return await addLatestDocs(
    mkRelm(
      await db.oneOrNone(sql`
          SELECT *
          FROM relms
          ${WHERE(filter)}
        `)
    )
  );
}

export async function getAllRelms({
  prefix,
  isPublic = true,
  excludeEmpty = true,
}: {
  prefix?: string;
  isPublic?: boolean;
  excludeEmpty?: boolean;
}) {
  const filter: any = {
    recent_rank: 1,
    is_public: isPublic,
  };
  if (prefix) {
    filter.relm_name = { like: `${prefix}%` };
  }
  if (excludeEmpty) {
    filter.entities_count = { gt: 0 };
  }
  return (
    await db.manyOrNone(sql`
        SELECT r.*, d.doc_id, d.entities_count, d.assets_count
        FROM relms r
        LEFT JOIN docs d ON d.relm_id = r.relm_id
        INNER JOIN (
          SELECT doc_id, RANK() OVER (PARTITION BY relm_id ORDER BY updated_at DESC) recent_rank
          FROM docs
          WHERE doc_type = 'permanent'
        ) z ON z.doc_id = d.doc_id
        ${WHERE(filter)}
      `)
  ).map((row) => mkRelmSummary(row));
}

export async function deleteRelm({ relmId }: { relmId: string }) {
  await db.none(sql`
      DELETE FROM relms
      WHERE relm_id = ${relmId}
    `);
  return true;
}

export async function createRelm({
  relmId,
  relmName,
  seedRelmId,
  isPublic,
  createdBy,
}: {
  relmId?: string;
  relmName: string;
  seedRelmId?: string;
  isPublic?: boolean;
  createdBy?: string;
}) {
  const attrs: any = {
    relm_name: relmName,
  };
  if (relmId !== undefined) attrs.relm_id = relmId;
  if (seedRelmId !== undefined) attrs.seed_relm_id = seedRelmId;
  if (isPublic !== undefined) attrs.is_public = isPublic;
  if (createdBy !== undefined) attrs.created_by = createdBy;

  const row = await db.oneOrNone(sql`
      ${INSERT("relms", attrs)}
      RETURNING *
    `);
  if (row !== null) {
    const relm = mkRelm(row);

    const doc = await Doc.setDoc({
      docType: "permanent",
      relmId: relm.relmId,
    });
    relm.permanentDocId = doc.docId;

    return relm;
  } else {
    return null;
  }
}

export async function updateRelm({
  relmId,
  relmName,
  seedRelmId,
  isPublic,
}: {
  relmId: string;
  relmName?: string;
  seedRelmId?: string;
  isPublic?: boolean;
}) {
  const attrs: any = {};
  if (relmName !== undefined) attrs.relm_name = relmName;
  if (seedRelmId !== undefined) attrs.seed_relm_id = seedRelmId;
  if (isPublic !== undefined) attrs.is_public = isPublic;

  if (getDefinedKeys(attrs).length > 0) {
    const row = await db.oneOrNone(sql`
        ${UPDATE("relms", attrs)}
        WHERE relm_id = ${relmId}
        RETURNING *
      `);

    if (row !== null) {
      return await addLatestDocs(mkRelm(row));
    } else {
      return null;
    }
  } else {
    return getRelm({ relmId });
  }
}
