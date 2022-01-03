import { ParticipantYBroker } from "../ParticipantYBroker";
import { WorldDoc } from "~/y-integration/WorldDoc";
import { Dispatch } from "../ProgramTypes";
import { Participant, RecvTransformCallback } from "../types";
import { DecoratedECSWorld } from "types/DecoratedECSWorld";
import { setTransformArrayOnParticipants } from "../Avatar/transform";

export const subscribeBroker =
  (
    worldDoc: WorldDoc,
    ecsWorld: DecoratedECSWorld,
    participants: Map<string, Participant>
  ) =>
  (dispatch: Dispatch) => {
    const broker = new ParticipantYBroker(worldDoc);
    const unsub = broker.subscribe(dispatch, (transformArray) => {
      setTransformArrayOnParticipants(ecsWorld, participants, transformArray);
    });
    dispatch({ id: "didSubscribeBroker", broker, unsub });
  };
