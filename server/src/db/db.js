const pgp = require('pg-promise')()
const { sql } = require('pg-sql')
const { createDb, migrate } = require('postgres-migrations')
const moment = require('moment')

const config = require('../config.js')

const conn = config.DATABASE_URL || {
  host: config.DATABASE_HOST,
  database: config.DATABASE_NAME,
  password: config.DATABASE_PASSWORD,
}
const db = pgp(conn)

// https://github.com/brianc/node-postgres/issues/818
function patchPgUseUTC(pg) {
  const parseDate = (val) =>
    val === null ? null : moment(val).format('YYYY-MM-DD')
  const DATATYPE_DATE = 1082
  pg.types.setTypeParser(DATATYPE_DATE, (val) => {
    return val === null ? null : parseDate(val)
  })
}

async function init() {
  const client = await db.$pool.connect()
  try {
    // await createDb(config.DATABASE_NAME, { client })
    await migrate({ client }, 'migrations')
  } finally {
    client.release()
  }
}

async function deinit() {
  db.$pool.end()
}

function compiledSql() {
  return sql.apply(null, arguments).compile()
}

module.exports = {
  db,
  sql: compiledSql,
  init,
  deinit,
}
