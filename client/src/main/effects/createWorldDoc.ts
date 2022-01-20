import { WorldDoc } from "~/y-integration/WorldDoc";
import { config } from "~/config";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import { AuthenticationHeaders } from "~/identity/types";

import { Dispatch } from "../ProgramTypes";
import { WorldDocStatus } from "types";

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

    let connected = false;
    connection.on("status", ({ status }: { status: WorldDocStatus }) => {
      dispatch({ id: "gotWorldDocStatus", status });

      if (status === "connected" && !connected) {
        connected = true;
        dispatch({ id: "createdWorldDoc", worldDoc });
      }
    });
  };
