const pgp = require('pg-promise')()
const { createDb, migrate } = require('postgres-migrations')

const { db, init, deinit } = require('./db.js')

async function setup() {
  await init()
}

async function teardown() {
  await deinit()
}

module.exports = {
  db,
  setup,
  teardown,
}
