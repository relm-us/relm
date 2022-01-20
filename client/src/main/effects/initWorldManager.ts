import { Participant } from "~/identity/types";
import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import { WorldDoc } from "~/y-integration/WorldDoc";
import { worldManager } from "~/world";

import { Dispatch } from "../ProgramTypes";
import { ParticipantYBroker } from "~/identity/ParticipantYBroker";
import { AVConnection } from "~/av";
import { PageParams } from "~/types";

export const initWorldManager =
  (
    broker: ParticipantYBroker,
    ecsWorld: DecoratedECSWorld,
    worldDoc: WorldDoc,
    pageParams: PageParams,
    relmDocId: string,
    avConnection: AVConnection,
    participants: Map<string, Participant>
  ) =>
  async (dispatch: Dispatch) => {
    await worldManager.init(
      dispatch,
      broker,
      ecsWorld,
      worldDoc,
      pageParams,
      relmDocId,
      avConnection,
      participants
    );
    dispatch({ id: "didInitWorldManager" });
  };
