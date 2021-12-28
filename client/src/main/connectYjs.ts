import { Dispatch } from "./RelmStateAndMessage";
import { WorldDoc } from "~/y-integration/WorldDoc";
import { worldManager } from "~/world";
import { config } from "~/config";
import type { SecureParams } from "~/identity/secureParams";

type YConnectState = "disconnected" | "connecting" | "connected" | "error";

export const connectYjs = (
  worldDoc: WorldDoc,
  subrelmDocId: string,
  secureParams: SecureParams
) => async (dispatch: Dispatch) => {
  console.log("trying to connect to yjs");
  const connection = worldDoc.justConnect(
    config.serverYjsUrl,
    subrelmDocId,
    secureParams
  );

  // Remove participant avatars when they disconnect
  worldDoc.provider.awareness.on("change", (changes) => {
    for (let id of changes.removed) {
      worldManager.identities.removeByClientId(id);
    }
  });

  // Update participants' transform data (position, rotation, etc.)
  worldDoc.provider.awareness.on("update", () => {
    const states = worldDoc.provider.awareness.getStates();

    states.forEach(({ m }, clientId) => {
      // Ignore updates that don't include matrix transform data
      if (!m) return;

      // Ignore updates about ourselves
      if (clientId === worldDoc.ydoc.clientID) return;

      worldManager.identities.setTransformData(clientId, m);
    });
  });

  connection.on("status", ({ status }: { status: YConnectState }) => {
    switch (status) {
      case "connected":
        return dispatch({ id: "connectedYjs" });
      case "error":
        return dispatch({
          id: "error",
          message: "error connecting to y-websocket",
        });
    }
  });
};
