import { createECSWorld } from "~/world/createECSWorld";
import { WorldDoc } from "~/y-integration/WorldDoc";
import { worldManager } from "~/world";
import { config } from "~/config";
import type { SecureParams } from "~/identity/secureParams";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

import { Dispatch } from "../RelmStateAndMessage";

type YConnectState = "disconnected" | "connecting" | "connected" | "error";

export const createWorldDoc = (
  physicsEngine: any,
  relmName: string,
  entryway: string,
  relmDocId: string,
  secureParams: SecureParams,
  twilioToken: string
) => async (dispatch: Dispatch) => {
  const ecsWorld = createECSWorld(physicsEngine) as DecoratedECSWorld;
  const worldDoc = new WorldDoc(ecsWorld);
  const connection = worldDoc.justConnect(
    config.serverYjsUrl,
    relmDocId,
    secureParams
  );
  worldManager.init(
    dispatch,
    ecsWorld,
    worldDoc,
    relmName,
    entryway,
    relmDocId,
    twilioToken
  );

  connection.once("status", ({ status }: { status: YConnectState }) => {
    switch (status) {
      case "connected":
        return dispatch({ id: "createdWorldDoc", ecsWorld, worldDoc });
      case "error":
        return dispatch({
          id: "error",
          message: "error connecting to y-websocket",
        });
    }
  });
};
