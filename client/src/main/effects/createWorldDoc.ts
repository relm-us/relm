import { createECSWorld } from "~/world/createECSWorld";
import { WorldDoc } from "~/y-integration/WorldDoc";
import { worldManager } from "~/world";
import { config } from "~/config";
import type { SecureParams } from "~/identity/secureParams";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

import { Dispatch, RelmState } from "../RelmStateAndMessage";

type YConnectState = "disconnected" | "connecting" | "connected" | "error";

export const createWorldDoc = (state: RelmState) => async (
  dispatch: Dispatch
) => {
  const ecsWorld = createECSWorld(state.physicsEngine) as DecoratedECSWorld;
  const worldDoc = new WorldDoc(ecsWorld);
  const connection = worldDoc.justConnect(
    config.serverYjsUrl,
    state.relmDocId,
    state.secureParams
  );
  worldManager.init(dispatch, { ...state, ecsWorld, worldDoc });

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
