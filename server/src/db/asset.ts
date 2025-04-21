import { db, sql, INSERT, UPDATE, WHERE } from "./db.js"
import { nullOr } from "../utils/index.js"
import { LIMIT, OFFSET, ORDER_BY } from "./pgSqlHelpers.js"

type AssetColumns = {
  asset_id: string
  user_id: string
  relm_id: string
  name: string
  description: string
  tags: string[]
  ecs_properties: any
  thumbnail: string
  created_by?: string
  created_at: string
}

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
  }
})

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
  name: string
  description?: string
  tags?: string[]
  ecsProperties?: any
  thumbnail?: string
  userId?: string
  relmId?: string
  createdBy?: string
}) {
  const attrs: any = {
    name,
    tags: JSON.stringify(tags ?? []),
    ecs_properties: JSON.stringify(ecsProperties ?? {}),
  }
  if (userId !== undefined) attrs.user_id = userId
  if (relmId !== undefined) attrs.relm_id = relmId
  if (description !== undefined) attrs.description = description
  if (thumbnail !== undefined) attrs.thumbnail = thumbnail
  if (createdBy !== undefined) attrs.created_by = createdBy

  let s = sql`
      ${INSERT("assets", attrs)}
      RETURNING *
    `
  // console.log("asset create sql", s);
  const row = await db.oneOrNone(s)
  if (row !== null) {
    const relm = mkAsset(row)
    return relm
  } else {
    return null
  }
}

export async function updateAsset({
  assetId,
  name,
  description,
  tags,
  ecsProperties,
  thumbnail,
  userId,
  relmId,
  createdBy,
}: {
  assetId: string
  name?: string
  description?: string
  tags?: string[]
  ecsProperties?: any
  thumbnail?: string
  userId?: string
  relmId?: string
  createdBy?: string
}) {
  if (!assetId) {
    throw new Error("assetId required")
  }
  const attrs: any = {}
  if (name !== undefined) attrs.name = name
  if (description !== undefined) attrs.description = description
  if (tags !== undefined) attrs.tags = JSON.stringify(tags ?? [])
  if (ecsProperties !== undefined) attrs.ecs_properties = JSON.stringify(ecsProperties ?? {})
  if (userId !== undefined) attrs.user_id = userId
  if (relmId !== undefined) attrs.relm_id = relmId
  if (thumbnail !== undefined) attrs.thumbnail = thumbnail
  if (createdBy !== undefined) attrs.created_by = createdBy

  const filter: any = {
    asset_id: assetId,
  }

  const row = await db.oneOrNone(sql`
      ${UPDATE("assets", attrs)}
      ${WHERE(filter)}
      RETURNING *
    `)

  if (row !== null) {
    const relm = mkAsset(row)
    return relm
  } else {
    return null
  }
}

// Return an asset by its ID
export async function getAsset({ assetId }: { assetId?: string }) {
  const filter: any = {
    asset_id: assetId,
  }
  const row = await db.oneOrNone(sql`
    SELECT *
    FROM assets
    ${WHERE(filter)}
    `)
  if (row !== null) {
    const relm = mkAsset(row)
    return relm
  } else {
    return null
  }
}

// Return zero or more assets based on query parameters
export async function queryAssets({
  keywords,
  tags,
  page,
  per_page,
  userId,
}: {
  keywords?: string[]
  tags?: string[]
  page?: number
  per_page?: number
  userId?: string
}) {
  const limit = per_page ?? 10
  const offset = (page ?? 0) * limit
  const filter: any = {}
  if (keywords && keywords.length > 0) {
    filter.name = { search: keywords.join(" & ") }
  }
  if (tags && tags.length > 0) {
    filter.tags = { "@>": JSON.stringify(tags) }
  }
  if (userId) {
    filter.user_id = userId
  } else {
    filter.user_id = null
  }

  let s = sql`
      SELECT *
      FROM assets
      ${WHERE(filter)}
      ${ORDER_BY(["-created_at"])}
      ${LIMIT(limit)}
      ${OFFSET(offset)}
    `

  const rows = await db.manyOrNone(s)
  return rows.map((row) => mkAsset(row))
}

export async function deleteAsset({ assetId }: { assetId: string }) {
  await db.none(sql`
      DELETE FROM assets
      WHERE asset_id = ${assetId}
    `)
  return true
}

export async function deleteAllAssets() {
  await db.none("TRUNCATE TABLE assets")
}
