import pgPromise from "pg-promise";
import { sql as pgSql } from "pg-sql";
import { migrate } from "postgres-migrations";

import * as config from "../config";

const pgp = pgPromise();

const conn = config.DATABASE_URL || {
  host: config.DATABASE_HOST,
  database: config.DATABASE_NAME,
  password: config.DATABASE_PASSWORD,
};

export const db = pgp(conn);

export async function init() {
  const pool: any = db.$pool;
  const client = await pool.connect();
  try {
    // await createDb(config.DATABASE_NAME, { client })
    await migrate({ client }, "migrations");
  } finally {
    client.release();
  }
}

export async function deinit() {
  db.$pool.end();
}

export function sql(...args) {
  return pgSql.apply(null, args).compile();
}

export const raw = pgSql.raw;

export { INSERT, UPDATE, WHERE, AND, OR, LIMIT, OFFSET } from "pg-sql-helpers";
