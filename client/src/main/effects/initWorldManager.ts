import { Participant } from "~/identity/types";
import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import { WorldDoc } from "~/y-integration/WorldDoc";
import { worldManager } from "~/world";

import { Dispatch } from "../ProgramTypes";
import { ParticipantYBroker } from "identity/ParticipantYBroker";

export const initWorldManager =
  (
    broker: ParticipantYBroker,
    ecsWorld: DecoratedECSWorld,
    worldDoc: WorldDoc,
    relmName: string,
    entryway: string,
    relmDocId: string,
    twilioToken: string,
    participants: Map<string, Participant>
  ) =>
  async (dispatch: Dispatch) => {
    await worldManager.init(
      dispatch,
      broker,
      ecsWorld,
      worldDoc,
      relmName,
      entryway,
      relmDocId,
      twilioToken,
      participants
    );
    dispatch({ id: "didInitWorldManager" });
  };
