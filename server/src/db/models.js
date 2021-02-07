const Invitation = require('./invitation.js')
const Permission = require('./permission.js')
const Player = require('./player.js')
const Relm = require('./relm.js')
const Doc = require('./doc.js')

const config = require('../config.js')

async function useToken({ token, relmId, playerId }) {
  if (token && token.length <= config.MAX_TOKEN_LENGTH) {
    const invite = await Invitation.useInvitation({
      token,
      relmId,
      playerId,
    })

    // Convert invitation to permissions
    await Permission.setPermissions({
      playerId,
      relmId: invite.relmId,
      permits: invite.permits,
    })

    return invite
  }

  return null
}

module.exports = {
  useToken,

  Invitation,
  Permission,
  Player,
  Relm,
  Doc,
}
