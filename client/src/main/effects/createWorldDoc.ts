import type { AuthenticationHeaders } from "relm-common"
import type { DecoratedECSWorld, WorldDocStatus } from "~/types"

import { WorldDoc } from "~/y-integration/WorldDoc"
import { config } from "~/config"

import type { Dispatch } from "../ProgramTypes"

export const createWorldDoc =
  (ecsWorld: DecoratedECSWorld, permanentDocId: string, transientDocId: string, authHeaders: AuthenticationHeaders) =>
  (dispatch: Dispatch) => {
    const worldDoc = new WorldDoc(ecsWorld)

    const permanentProvider = worldDoc.connect(config.serverYjsUrl, permanentDocId, worldDoc.ydoc, authHeaders)

    // Connect transient websocket, too
    const transientProvider = worldDoc.connect(config.serverYjsUrl, transientDocId, worldDoc.transientYdoc, authHeaders)

    let connected = false

    const onStatus = ({ status }) => {
      dispatch({ id: "gotWorldDocStatus", status })

      if (status === "connected" && !connected) {
        connected = true
        dispatch({
          id: "createdWorldDoc",
          worldDoc,
          slowAwareness: permanentProvider.awareness,
          rapidAwareness: transientProvider.awareness,
        })
      }
    }

    // TODO: keep this out of the worldDoc internals
    permanentProvider.on("status", onStatus)
    worldDoc.unsubs.push(() => permanentProvider.off("status", onStatus))

    // TODO: monitor transient connection status also
    // ...
  }
