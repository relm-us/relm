import * as Doc from "./doc";
import { db, sql, INSERT, UPDATE, WHERE } from "./db";
import { getDefinedKeys, nullOr } from "../utils";
import { LIMIT, OFFSET, ORDER_BY } from "./pgSqlHelpers";

type AssetColumns = {
  asset_id: string;
  user_id: string;
  relm_id: string;
  name: string;
  description: string;
  tags: string[];
  ecs_properties: any;
  thumbnail: string;
  created_by?: string;
  created_at: string;
};

const mkAsset = nullOr((cols: AssetColumns) => {
  return {
    assetId: cols.asset_id,
    userId: cols.user_id,
    relmId: cols.relm_id,
    name: cols.name,
    description: cols.description,
    tags: cols.tags,
    ecsProperties: cols.ecs_properties,
    thumbnail: cols.thumbnail,
    createdBy: cols.created_by || null,
    createdAt: cols.created_at,
  };
});

export async function createAsset({
  name,
  description,
  tags,
  ecsProperties,
  thumbnail,
  userId,
  relmId,
  createdBy,
}: {
  name: string;
  description?: string;
  tags?: string[];
  ecsProperties?: any;
  thumbnail?: string;
  userId?: string;
  relmId?: string;
  createdBy?: string;
}) {
  const attrs: any = {
    name,
    tags: JSON.stringify(tags ?? []),
    ecs_properties: JSON.stringify(ecsProperties ?? {}),
  };
  if (userId !== undefined) attrs.user_id = userId;
  if (relmId !== undefined) attrs.relm_id = relmId;
  if (description !== undefined) attrs.description = description;
  if (thumbnail !== undefined) attrs.thumbnail = thumbnail;
  if (createdBy !== undefined) attrs.created_by = createdBy;

  let s = sql`
      ${INSERT("assets", attrs)}
      RETURNING *
    `;
  // console.log("asset create sql", s);
  const row = await db.oneOrNone(s);
  if (row !== null) {
    const relm = mkAsset(row);
    return relm;
  } else {
    return null;
  }
}

export async function queryAssets({
  keywords,
  tags,
  page,
  per_page,
}: {
  keywords?: string[];
  tags?: string[];
  // userId: string,
  // relmId: string
  page?: number;
  per_page?: number;
}) {
  const limit = per_page ?? 10;
  const offset = (page ?? 0) * limit;
  const filter: any = {};
  if (keywords && keywords.length > 0) {
    filter.name = { search: keywords.join(" & ") };
  }
  if (tags && tags.length > 0) {
    filter.tags = { "@>": JSON.stringify(tags) };
  }
  let s = sql`
      SELECT *
      FROM assets
      ${WHERE(filter)}
      ${ORDER_BY(["-created_at"])}
      ${LIMIT(limit)}
      ${OFFSET(offset)}
    `;
  // console.log("asset query sql", s);
  const rows = await db.manyOrNone(s);
  return rows.map((row) => mkAsset(row));
}

export async function deleteAsset({ assetId }: { assetId: string }) {
  await db.none(sql`
      DELETE FROM assets
      WHERE asset_id = ${assetId}
    `);
  return true;
}

export async function deleteAllAssets() {
  await db.none("TRUNCATE TABLE assets");
}
