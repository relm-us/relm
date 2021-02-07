const util = require('./util.js')
const models = require('./db/models.js')
const createError = require('http-errors')

const { normalizeRelmName, respond, joinError } = util
const { Player, Permission, Relm, useToken } = models

function getParam(req, key) {
  if (key in req.query) {
    return req.query[key]
  } else {
    return req.headers[`x-relm-${key}`]
  }
}

module.exports = {
  relmName: (key = 'relmName') => {
    return (req, res, next) => {
      if (req.params[key]) {
        req.relmName = normalizeRelmName(req.params[key])
        next()
      } else {
        respond(res, 400, {
          status: 'error',
          reason: 'relm name required',
        })
      }
    }
  },

  relmExists: () => {
    return async (req, res, next) => {
      req.relm = await Relm.getRelm({ relmName: req.relmName })
      if (!req.relm) {
        respond(res, 404, {
          status: 'error',
          reason: 'relm does not exist',
        })
      } else {
        next()
      }
    }
  },

  authenticated: () => {
    return async (req, _res, next) => {
      const playerId = getParam(req, 'id')

      // the `id` (playerId), signed
      const sig = getParam(req, 's')

      const x = getParam(req, 'x')
      const y = getParam(req, 'y')

      try {
        req.verifiedPubKey = await Player.findOrCreateVerifiedPubKey({
          playerId,
          sig,
          x,
          y,
        })
        req.authenticatedPlayerId = playerId
        next()
      } catch (err) {
        next(joinError(err, Error(`can't authenticate`)))
      }
    }
  },

  acceptToken: () => {
    return async (req, _res, next) => {
      const token = getParam(req, 't')
      const relmId = req.relm ? req.relm.relmId : undefined
      const playerId = req.authenticatedPlayerId

      try {
        await useToken({ token, relmId, playerId })
        next()
      } catch (err) {
        if (err.message.match(/no longer valid/)) {
          next()
        } else {
          next(err)
        }
      }
    }
  },

  authorized: (permission) => {
    return async (req, _res, next) => {
      if (
        req.relm &&
        req.relm.isPublic === true &&
        permission === Permission.ACCESS
      ) {
        // Public relms don't need special permission to access
        next()
      } else {
        let permitted = false
        try {
          const permissions = await Permission.getPermissions({
            playerId: req.authenticatedPlayerId,
            relmId: req.relm ? req.relm.relmId : undefined,
          })

          permitted = permissions.has(permission)
        } catch (err) {
          next(err)
        }

        if (permitted === true) {
          next()
        } else {
          next(createError(401, 'unauthorized'))
        }
      }
    }
  },
}
