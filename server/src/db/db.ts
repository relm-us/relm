import pgPromise from "pg-promise"
import { sql as pgSql } from "pg-sql"
import { migrate } from "postgres-migrations"

import { config } from "../config.js"

const pgp = pgPromise()

type ConnectionParams = {
  host?: string
  database: string
  password?: string
}

let conn: string | ConnectionParams

if (config.DATABASE_URL) {
  conn = config.DATABASE_URL
} else {
  conn = {
    host: config.DATABASE_HOST,
    database: config.DATABASE_NAME,
  }
  if (config.DATABASE_PASSWORD) conn.password = config.DATABASE_PASSWORD
}

// console.log("Connecting to Postgresql...", conn);

export const db = pgp(conn)

export async function init() {
  const pool: any = db.$pool
  const client = await pool.connect()
  try {
    // await createDb(config.DATABASE_NAME, { client })
    await migrate({ client }, "migrations")
  } finally {
    client.release()
  }
}

export async function deinit() {
  db.$pool.end()
}

export function sql(...args) {
  return pgSql.apply(null, args).compile()
}

export const raw = pgSql.raw

export const IN = (values) => {
  return pgSql`IN ${pgSql.raw("(")}${pgSql.join(
    values.map((v) => pgSql.value(v)),
    ", ",
  )}${pgSql.raw(")")}`
}

export {
  INSERT,
  UPDATE,
  VALUES,
  WHERE,
  AND,
  OR,
  LIMIT,
  OFFSET,
} from "./pgSqlHelpers.js"
