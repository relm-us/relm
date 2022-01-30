import type { Participant, DecoratedECSWorld } from "~/types";
import type { Dispatch } from "../ProgramTypes";

import { WorldDoc } from "~/y-integration/WorldDoc";
import { ParticipantYBroker } from "~/identity/ParticipantYBroker";
import { worldManager } from "~/world";

export const subscribeBroker =
  (
    worldDoc: WorldDoc,
    ecsWorld: DecoratedECSWorld,
    participants: Map<string, Participant>
  ) =>
  (dispatch: Dispatch) => {
    const broker = new ParticipantYBroker(worldDoc);
    broker.subscribe(dispatch, (transformArray) => {
      // Store the transform array for later, when we can use it
      // in a consistent manner within the ECS loop
      worldManager.setTransformArray(transformArray);
    });
    dispatch({ id: "didSubscribeBroker", broker });
  };
