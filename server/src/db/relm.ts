import * as Doc from './doc'
import { db, sql, INSERT, UPDATE, WHERE } from './db'
import { getDefinedKeys, nullOr } from "../utils";

type RelmColumns = {
  relm_id: string;
  relm_name: string;
  is_public: boolean;
  created_by?: string;
  created_at: string;
};

const mkRelm = nullOr((cols: RelmColumns) => {
  return {
    relmId: cols.relm_id,
    relmName: cols.relm_name,
    isPublic: cols.is_public,
    createdBy: cols.created_by || null,
    createdAt: cols.created_at,
  };
});

type RelmSummaryColumns = {
  relm_id: string;
  relm_name: string;
  is_public: boolean;
  created_at: string;
};

const mkRelmSummary = nullOr((cols: RelmSummaryColumns) => {
  return {
    relmId: cols.relm_id,
    relmName: cols.relm_name,
    isPublic: cols.is_public,
    createdAt: cols.created_at,
  };
});

async function addLatestDocs(relm) {
  if (relm === null) {
    return null;
  }

  const docs = await Doc.getLatestDocs({ relmId: relm.relmId });

  if (docs.transient) {
    relm.transientDocId = docs.transient.docId;
  }
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
}: {
  prefix?: string;
  isPublic?: boolean;
}) {
  const filter: any = {
    is_public: isPublic,
  };
  if (prefix) {
    filter.relm_name = { like: `${prefix}%` };
  }
  return (
    await db.manyOrNone(sql`
        SELECT * FROM relms
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
  isPublic,
  createdBy,
}: {
  relmId?: string;
  relmName: string;
  isPublic?: boolean;
  createdBy?: string;
}) {
  const attrs: any = {
    relm_name: relmName,
  };
  if (relmId !== undefined) attrs.relm_id = relmId;
  if (isPublic !== undefined) attrs.is_public = isPublic;
  if (createdBy !== undefined) attrs.created_by = createdBy;

  const row = await db.oneOrNone(sql`
      ${INSERT("relms", attrs)}
      RETURNING *
    `);
  if (row !== null) {
    const relm = mkRelm(row);

    relm.transientDocId = (
      await Doc.setDoc({
        docType: "transient",
        relmId: relm.relmId,
      })
    ).docId;

    relm.permanentDocId = (
      await Doc.setDoc({
        docType: "permanent",
        relmId: relm.relmId,
      })
    ).docId;

    return relm;
  } else {
    return null;
  }
}

export async function updateRelm({
  relmId,
  relmName,
  isPublic,
}: {
  relmId: string;
  relmName?: string;
  isPublic?: boolean;
}) {
  const attrs: any = {};
  if (relmName !== undefined) attrs.relm_name = relmName;
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
