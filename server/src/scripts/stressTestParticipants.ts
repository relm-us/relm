import parseArgs from "minimist"
import { RelmSocket } from "./client/RelmSocket.js"

/*
  This script is responsible for stress testing Relm to easily see how well it performs under stress.
  This script replicates fake users that connect to a Relm and try to move around.

  The following arguments should be passed when running
  --relm <relm name>
  --count <# of bots to spawn>
  --api <api base url>
  --radius <max amount of units to move away from spawn location>
  
  The following arguments can be passed when running
  --invite <invite code>
  --jwt <jwt>
  --socket-max <# of bots to host per socket>
*/
const args = parseArgs(process.argv.slice(2))

const { relm: RELM_NAME, count: BOT_COUNT, invite: INVITE_CODE, jwt: JWT, api: API_URL, radius: RADIUS } = args

if (!RELM_NAME || !BOT_COUNT || !API_URL || !RADIUS) {
  throw Error("Missing --relm or --count or --api or --radius")
}

const BOTS_PER_CONN = Number.parseInt(args["socket-max"] || 500)
if (isNaN(BOTS_PER_CONN)) {
  throw Error("Invalid socket-max argument specified.")
}

function getRandomDirection() {
  return [-1, 1][Math.floor(Math.random() * 2)]
}
;(async () => {
  const maxShardCount = Math.ceil(BOT_COUNT / BOTS_PER_CONN)
  for (let shardId = 0; shardId < maxShardCount; shardId++) {
    const localShardId = shardId

    const botsToCreate = Math.min(BOTS_PER_CONN, BOT_COUNT - BOTS_PER_CONN * shardId)

    const socket = new RelmSocket({
      relmName: RELM_NAME,
      auth: {
        api: API_URL,
        invite: INVITE_CODE,
        jwt: JWT,
      },
      bot: {
        amount: botsToCreate,
        getName: (botId) => `[Shard ${localShardId}] Bot #${botId}`,
        onConnect: (bot) => {
          // Example script to move bots around the map randomly.
          let xDirection = getRandomDirection()
          let zDirection = getRandomDirection()

          setInterval(() => {
            let currentTransform = bot.getTransform()

            const shouldSwitchXDirection =
              Math.abs(currentTransform[0] - bot.getSpawnPos()[0]) >= RADIUS || Math.random() >= 0.8
            if (shouldSwitchXDirection) {
              xDirection = -xDirection
            }

            const shouldSwitchZDirection =
              Math.abs(currentTransform[2] - bot.getSpawnPos()[1]) >= RADIUS || Math.random() >= 0.8
            if (shouldSwitchZDirection) {
              zDirection = -zDirection
            }

            currentTransform[0] += 0.2 * xDirection
            currentTransform[2] += 0.2 * zDirection

            bot.setTransform(currentTransform)
          }, 50)
        },
      },
    })
    await socket.connect()
    console.log(`Shard ${shardId} has been started (${botsToCreate} bots)`)
  }
  console.log("All bot connections created.")
})()
