import { Security } from "relm-common";
import { Participant } from "types/identity";
import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import { WorldDoc } from "~/y-integration/WorldDoc";
import { worldManager } from "~/world";

import { Dispatch, State } from "../ProgramTypes";
import { ParticipantBroker } from "~/identity/ParticipantBroker";
import { AVConnection } from "~/av";
import { PageParams } from "~/types";

export const initWorldManager =
  (
    state: State,
    broker: ParticipantBroker,
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
      state,
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
