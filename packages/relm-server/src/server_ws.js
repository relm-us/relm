const WSServer = require('ws').Server
const server = require('http').createServer()
const app = require('./server_http')
const util = require('./util.js')
const models = require('./db/models.js')
// const setupWSConnection = require('y-websocket/bin/utils.js').setupWSConnection
const setupWSConnection = require('./yws.js').setupWSConnection

const { Player, Permission, Doc } = models

let wss = new WSServer({ noServer: true })

wss.on('connection', setupWSConnection)

server.on('request', app)

function getRelmDocFromRequest(req) {
  return req.url.slice(1).split('?')[0]
}

server.on('upgrade', async (req, socket, head) => {
  const docId = getRelmDocFromRequest(req)
  const params = util.getUrlParams(req.url)

  const playerId = params.get('id')
  const sig = params.get('s')
  let x = params.get('x')
  let y = params.get('y')

  const verifiedPubKey = await Player.findOrCreateVerifiedPubKey({
    playerId,
    sig,
    x,
    y,
  })

  // Check that we are authenticated first
  if (verifiedPubKey) {
    // Get relm from docId
    const doc = await Doc.getDoc({ docId })

    if (doc === null) {
      console.log(
        `Visitor sought to sync doc '${docId}' but was rejected because it doesn't exist`
      )
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
      socket.destroy()
    } else {
      const permissions = await Permission.getPermissions({
        playerId,
        relmId: doc.relmId,
      })

      const permitted = permissions.has(Permission.ACCESS)

      if (permitted) {
        wss.handleUpgrade(req, socket, head, (conn) => {
          wss.emit('connection', conn, req)
        })
      } else {
        console.log(
          `Visitor sought to enter '${docId}' but was rejected because unauthorized`,
          params
        )
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
      }
    }
  }
})

module.exports = server
