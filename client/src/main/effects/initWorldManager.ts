import type { PageParams } from "~/types"
import type { Participant } from "~/types/identity"
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld"

import type { WorldDoc } from "~/y-integration/WorldDoc"
import type { ParticipantBroker } from "~/identity/ParticipantBroker"
import type { AVConnection } from "~/av"

import type { Dispatch, State } from "../ProgramTypes"

import { worldManager } from "~/world"

export const initWorldManager =
  (
    state: State,
    broker: ParticipantBroker,
    ecsWorld: DecoratedECSWorld,
    worldDoc: WorldDoc,
    pageParams: PageParams,
    relmDocId: string,
    avConnection: AVConnection,
    participants: Map<string, Participant>,
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
      participants,
    )
    dispatch({ id: "didInitWorldManager" })
  }
