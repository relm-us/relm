import { WorldDoc } from "~/y-integration/WorldDoc";
import { Dispatch } from "../ProgramTypes";
import type { Participant, DecoratedECSWorld } from "~/types";
import { ParticipantYBroker } from "~/identity/ParticipantYBroker";
import { setTransformArrayOnParticipants } from "~/identity/Avatar/transform";

export const subscribeBroker =
  (
    worldDoc: WorldDoc,
    ecsWorld: DecoratedECSWorld,
    participants: Map<string, Participant>
  ) =>
  (dispatch: Dispatch) => {
    const broker = new ParticipantYBroker(worldDoc);
    const unsub = broker.subscribe(dispatch, (transformArray) => {
      setTransformArrayOnParticipants(
        ecsWorld,
        participants,
        transformArray,
        (participant) => {
          dispatch({ id: "participantJoined", participant });
        }
      );
    });
    dispatch({ id: "didSubscribeBroker", broker, unsub });
  };
