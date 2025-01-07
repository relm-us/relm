import type { Permission, Permits } from "./permission.js";

import * as Doc from "./doc.js";
import { db, sql, INSERT, UPDATE, WHERE } from "./db.js";
import {
  arrayToBooleanObject,
  booleanObjectToArray,
  getDefinedKeys,
  nullOr,
} from "../utils/index.js";
import { validPermission } from "./permission.js";

type RelmColumns = {
  relm_id: string;
  relm_name: string;
  seed_relm_id: string;
  public_permits: Permits;
  created_at: Date;

  clone_permit_required?: string;
  clone_permit_assigned?: string;
  created_by?: string;
};

export type RelmData = {
  relmId: string;
  relmName: string;
  seedRelmId: string;
  publicPermits: Permits;
  createdAt: Date;

  clonePermitRequired?: string;
  clonePermitAssigned?: string;
  createdBy?: string;
};

export type StatsData = {
  assetsCount: number;
  entitiesCount: number;
};

export type DocsData = {
  permanentDocId?: string;
  transientDocId?: string;
};

const mkRelm = nullOr((cols: RelmColumns): RelmData => {
  return {
    relmId: cols.relm_id,
    relmName: cols.relm_name,
    seedRelmId: cols.seed_relm_id,
    publicPermits: cols.public_permits,
    clonePermitRequired: cols.clone_permit_required || null,
    clonePermitAssigned: cols.clone_permit_assigned || null,
    createdBy: cols.created_by || null,
    createdAt: cols.created_at,
  };
});

type RelmSummaryColumns = {
  relm_id: string;
  relm_name: string;
  seed_relm_id: string;
  public_permits: Permits;
  clone_permit_required: string;
  clone_permit_assigned: string;
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
    publicPermits: cols.public_permits,
    clonePermitRequired: cols.clone_permit_required,
    clonePermitAssigned: cols.clone_permit_assigned,
    createdAt: cols.created_at,
    docId: cols.doc_id,
    assetsCount: cols.assets_count,
    entitiesCount: cols.entities_count,
  };
});

async function decorateRelmWithLatestDocs(
  relm: RelmData & DocsData & StatsData,
): Promise<RelmData & DocsData & StatsData> {
  if (relm == null) {
    return null;
  }

  const docs = await Doc.getLatestDocs({ relmId: relm.relmId });

  if (docs.permanent) {
    relm.permanentDocId = docs.permanent.docId;
    relm.entitiesCount = docs.permanent.entitiesCount;
    relm.assetsCount = docs.permanent.assetsCount;
  } else {
    const tdoc = await Doc.setDoc({
      docType: "permanent",
      relmId: relm.relmId,
    });
    relm.permanentDocId = tdoc.docId;
    relm.entitiesCount = 1;
    relm.assetsCount = 1;
  }

  if (docs.transient) {
    relm.transientDocId = docs.transient.docId;
  } else {
    const tdoc = await Doc.setDoc({
      docType: "transient",
      relmId: relm.relmId,
    });
    relm.transientDocId = tdoc.docId;
  }

  return relm;
}

export async function getRelm({ relmId, relmName }: { relmId?: string; relmName?: string }) {
  const filter: any = {};
  if (relmId) {
    filter.relm_id = relmId;
  }
  if (relmName) {
    filter.relm_name = relmName;
  }

  const relm = await db.oneOrNone(sql`
    SELECT *
    FROM relms
    ${WHERE(filter)}
  `);

  if (!relm) throw new Error(`relm not found: ${relmName || relmId}`);

  const relmData = mkRelm(relm) as RelmData & DocsData & StatsData;

  return await decorateRelmWithLatestDocs(relmData);
}

export async function getAllRelms({
  prefix,
  isPublic,
  includeEmpty = true,
}: {
  prefix?: string;
  isPublic?: boolean;
  includeEmpty?: boolean;
}) {
  const filter: any = {
    recent_rank: 1,
  };
  if (isPublic === true) {
    // `public_permits` is a JSON object with permissions as keys and boolean as values.
    // We use the `@>` postgres operator to test if the "access" permission is included & true.
    filter.public_permits = { "@>": '{"access": true}' };
  }
  if (prefix) {
    filter.relm_name = { like: `${prefix}%` };
  }
  if (!includeEmpty) {
    filter.entities_count = { gt: 0 };
  }
  const s = sql`
        SELECT r.*, d.doc_id, d.entities_count, d.assets_count
        FROM relms r
        LEFT JOIN docs d ON d.relm_id = r.relm_id
        INNER JOIN (
          SELECT doc_id, RANK() OVER (PARTITION BY relm_id ORDER BY updated_at DESC) recent_rank
          FROM docs
          WHERE doc_type = 'permanent'
        ) z ON z.doc_id = d.doc_id
        ${WHERE(filter)}
      `;
  return (await db.manyOrNone(s)).map((row) => mkRelmSummary(row));
}

export async function getDashboardRelms(userId: string) {
  return await db.manyOrNone(sql`
    SELECT r.relm_name, v.created_at as last_visited_at
    FROM relms r
    JOIN visits_most_recent v USING (relm_id)
    WHERE v.user_id = ${userId}
    -- order by most recently visited first:
    ORDER BY v.created_at DESC
  `);
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
  publicPermissions,
  clonePermitRequired,
  clonePermitAssigned,
  createdBy,
}: {
  relmId?: string;
  relmName: string;
  seedRelmId?: string;
  publicPermissions?: Permission[];
  clonePermitRequired?: string;
  clonePermitAssigned?: string;
  createdBy?: string;
}): Promise<RelmData & DocsData> {
  const attrs: any = {
    relm_name: relmName,
  };
  if (relmId !== undefined) attrs.relm_id = relmId;
  if (seedRelmId !== undefined) attrs.seed_relm_id = seedRelmId;
  if (publicPermissions !== undefined)
    attrs.public_permits = arrayToBooleanObject(publicPermissions);
  if (clonePermitRequired !== undefined) attrs.clone_permit_required = clonePermitRequired;
  if (clonePermitAssigned !== undefined) attrs.clone_permit_assigned = clonePermitAssigned;
  if (createdBy !== undefined) attrs.created_by = createdBy;

  const row = await db.oneOrNone(sql`
      ${INSERT("relms", attrs)}
      RETURNING *
    `);
  if (row !== null) {
    const relm = mkRelm(row) as RelmData & DocsData;

    const doc = await Doc.setDoc({
      docType: "permanent",
      relmId: relm.relmId,
    });
    relm.permanentDocId = doc.docId;

    const tdoc = await Doc.setDoc({
      docType: "transient",
      relmId: relm.relmId,
    });
    relm.transientDocId = tdoc.docId;

    return relm;
  } else {
    return null;
  }
}

export async function updateRelm({
  relmId,
  relmName,
  publicPermissions,
  clonePermitRequired,
  clonePermitAssigned,
}: {
  relmId: string;
  relmName?: string;
  publicPermissions?: Array<Permission>;
  clonePermitRequired?: string;
  clonePermitAssigned?: string;
}): Promise<RelmData & DocsData & StatsData> {
  const attrs: any = {};
  if (relmName !== undefined) attrs.relm_name = relmName;
  if (publicPermissions !== undefined)
    attrs.public_permits = arrayToBooleanObject(publicPermissions);
  if (clonePermitRequired !== undefined) {
    if (!validPermission(clonePermitRequired)) return null;
    attrs.clone_permit_required = clonePermitRequired;
  }
  if (clonePermitAssigned !== undefined) {
    if (!validPermission(clonePermitAssigned)) return null;
    attrs.clone_permit_assigned = clonePermitAssigned;
  }

  if (getDefinedKeys(attrs).length > 0) {
    const row = await db.oneOrNone(sql`
        ${UPDATE("relms", attrs)}
        WHERE relm_id = ${relmId}
        RETURNING *
      `);

    if (row !== null) {
      return await decorateRelmWithLatestDocs(mkRelm(row) as RelmData & DocsData & StatsData);
    } else {
      return null;
    }
  } else {
    return getRelm({ relmId });
  }
}
