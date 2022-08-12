import type { AuthenticationHeaders } from "relm-common";
import type { DecoratedECSWorld, WorldDocStatus } from "~/types";

import { WorldDoc } from "~/y-integration/WorldDoc";
import { config } from "~/config";

import { Dispatch } from "../ProgramTypes";

export const createWorldDoc =
  (
    ecsWorld: DecoratedECSWorld,
    relmDocId: string,
    authHeaders: AuthenticationHeaders
  ) =>
  (dispatch: Dispatch) => {
    const worldDoc = new WorldDoc(ecsWorld);

    worldDoc.connect(config.serverUrl, relmDocId, authHeaders);

    let connected = false;

    worldDoc.subscribeStatus((status: WorldDocStatus) => {
      dispatch({ id: "gotWorldDocStatus", status });

      if (status === "connected" && !connected) {
        connected = true;
        dispatch({ id: "createdWorldDoc", worldDoc });
      }
    });
  };
