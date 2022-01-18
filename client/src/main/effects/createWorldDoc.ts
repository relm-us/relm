import { WorldDoc } from "~/y-integration/WorldDoc";
import { config } from "~/config";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import { AuthenticationHeaders } from "~/identity/types";

import { Dispatch } from "../ProgramTypes";

type YConnectState = "disconnected" | "connecting" | "connected" | "error";

export const createWorldDoc =
  (
    ecsWorld: DecoratedECSWorld,
    relmDocId: string,
    authHeaders: AuthenticationHeaders
  ) =>
  async (dispatch: Dispatch) => {
    const worldDoc = new WorldDoc(ecsWorld);

    const connection = worldDoc.connect(
      config.serverYjsUrl,
      relmDocId,
      authHeaders
    );

    connection.once("status", ({ status }: { status: YConnectState }) => {
      switch (status) {
        case "connected":
          return dispatch({ id: "createdWorldDoc", worldDoc });
        case "error":
          return dispatch({
            id: "error",
            message: "error connecting to y-websocket",
          });
      }
    });
  };
