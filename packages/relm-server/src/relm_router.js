const express = require('express')
const cors = require('cors')
const createError = require('http-errors')
const Y = require('yjs')

const util = require('./util.js')
const models = require('./db/models.js')
const middleware = require('./middleware.js')
// const docs = require('y-websocket/bin/utils.js').docs
const yws = require('./yws.js')
const { persistence, findOrCreateDoc } = yws
const { Invitation, Permission, Relm, Doc } = models
const { wrapAsync, uuidv4 } = util

const relmRouter = (module.exports = express.Router())

// Create a new relm
relmRouter.post(
  '/create',
  cors(),
  middleware.authenticated(),
  middleware.authorized(Permission.ADMIN),
  wrapAsync(async (req, res) => {
    const relm = await Relm.getRelm({ relmName: req.relmName })
    if (relm !== null) {
      throw Error(`relm '${req.relmName}' already exists`)
    } else {
      console.log(`Creating relm '${req.relmName}'`)
      const relm = await Relm.createRelm({
        relmName: req.relmName,
        isPublic: !!req.body.isPublic,
        defaultEntryway: req.body.defaultEntryway,
        createdBy: req.authenticatedPlayerId,
      })

      // Create the transient & permanent Y documents for the new relm
      // yws.findOrCreateDoc(relm.transientVersion)
      // yws.findOrCreateDoc(relm.permanentVersion)

      return util.respond(res, 200, {
        status: 'success',
        action: 'create',
        relm,
      })
    }
  })
)

relmRouter.delete(
  '/delete',
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized(Permission.ADMIN),
  wrapAsync(async (req, res) => {
    await Relm.deleteRelm({ relmId: req.relm.relmId })
    return util.respond(res, 200, {
      status: 'success',
      action: 'delete',
      relm,
    })
  })
)

// Get an existing relm
relmRouter.get(
  '/meta',
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized(Permission.ACCESS),
  wrapAsync(async (req, res) => {
    const permanentDoc = await persistence.getYDoc(req.relm.permanentDocId)
    req.relm.permanentDocSize = Y.encodeStateAsUpdate(permanentDoc).byteLength

    return util.respond(res, 200, {
      status: 'success',
      action: 'read',
      relm: req.relm,
    })
  })
)

// Get an existing relm
relmRouter.get(
  '/data',
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized(Permission.ACCESS),
  wrapAsync(async (req, res) => {
    const permanentDoc = await persistence.getYDoc(req.relm.permanentDocId)
    const objects = permanentDoc.getMap('objects')
    req.relm.permanentDoc = objects.toJSON()

    return util.respond(res, 200, {
      status: 'success',
      action: 'read',
      relm: req.relm,
    })
  })
)

relmRouter.post(
  '/truncate',
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized(Permission.EDIT),
  wrapAsync(async (req, res) => {
    const relm = req.relm

    const permanentDoc = await persistence.getYDoc(req.relm.permanentDocId)

    const newDocName = uuidv4()
    console.log('newDocName', newDocName)
    const ydoc = truncateYDoc(permanentDoc, newDocName)

    await Doc.setDoc({
      docId: newDocName,
      docType: 'permanent',
      relmId: relm.relmId,
    })

    return util.respond(res, 200, {
      status: 'success',
      action: 'truncate',
    })
  })
)

function relmCopyObjects(src, dest) {
  for (const [uuid, attrs] of Object.entries(src.toJSON())) {
    const objectYMap = new Y.Map()

    for (const [key, values] of Object.entries(attrs)) {
      if (key.indexOf('@') === 0) {
        objectYMap.set(key, values)
      } else {
        const attrYMap = new Y.Map()
        for (const [k, v] of Object.entries(values)) {
          attrYMap.set(k, v)
        }
        objectYMap.set(key, attrYMap)
      }
    }

    dest.set(uuid, objectYMap)
  }
}

function truncateYDoc(ydoc, newDocName) {
  const truncatedYDoc = findOrCreateDoc(newDocName)

  const objects = ydoc.getMap('objects')

  const truncatedObjects = truncatedYDoc.getMap('objects')

  relmCopyObjects(objects, truncatedObjects)

  return truncatedYDoc
}

// Update an existing relm
relmRouter.put(
  '/meta',
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized(Permission.EDIT),
  wrapAsync(async (req, res) => {
    const attrs = {
      relmId: req.relm.relmId,
      isPublic: !!req.body.isPublic,
      defaultEntryway: req.body.defaultEntryway,
      createdBy: req.authenticatedPlayerId,
    }

    const relm = await Relm.updateRelm(attrs)
    return util.respond(res, 200, {
      status: 'success',
      action: 'update',
      relm,
    })
  })
)

// Check permission for player in an existing relm
relmRouter.get(
  '/can/:permission',
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.acceptToken(),
  wrapAsync(async (req, res) => {
    const auth = middleware.authorized(req.params.permission)
    await auth(req, res, (err) => {
      if (!err) {
        util.respond(res, 200, {
          status: 'success',
          action: 'permit',
          relm: req.relm,
        })
      } else {
        console.warn('permission err', err)
        throw err
      }
    })
  })
)

// Create an invitation to a relm
relmRouter.post(
  '/invitation',
  cors(),
  middleware.relmExists(),
  middleware.authenticated(),
  middleware.authorized('invite'),
  wrapAsync(async (req, res) => {
    const attrs = {
      relmId: req.relm.relmId,
      createdBy: req.authenticatedPlayerId,
      permits: [Permission.ACCESS],
    }

    if (req.body) {
      if ('token' in req.body) {
        attrs.token = req.body.token
      }
      if ('maxUses' in req.body) {
        attrs.maxUses = req.body.maxUses
      }
      if ('permits' in req.body) {
        attrs.permits = [...Permission.filteredPermits(req.body.permits)]
      }
    }

    let invitation
    try {
      invitation = await Invitation.createInvitation(attrs)
    } catch (err) {
      if (err.message.match(/duplicate key/)) {
        throw createError(400, 'an invitation with that token already exists')
      }
    }

    util.respond(res, 200, {
      status: 'success',
      action: 'create',
      invitation: Invitation.toJSON(invitation),
    })
  })
)
