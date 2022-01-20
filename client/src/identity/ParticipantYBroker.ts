import * as Y from "yjs";

import { withMapEdits } from "relm-common/yrelm";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { Dispatch } from "./ProgramTypes";
import {
  IdentityData,
  Participant,
  RecvTransformCallback,
  TransformData,
} from "./types";
import { playerId } from "./playerId";
import { setTransformArrayOnParticipants } from "./Avatar/transform";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

const transformArray = [];

/**
 * An adapter between the WorldDoc's "identities" map (Yjs) and
 * our participant-focused functional reactive runtime.
 */
export class ParticipantYBroker {
  worldDoc: WorldDoc;

  constructor(worldDoc: WorldDoc) {
    this.worldDoc = worldDoc;
  }

  get yidentities(): Y.Map<IdentityData> {
    return this.worldDoc.ydoc.getMap("identities");
  }

  get awareness() {
    return this.worldDoc.provider.awareness;
  }

  setIdentityData(participantId: string, identityData: IdentityData) {
    this.yidentities.set(participantId, identityData);
  }

  setAwareness(key, value) {
    this.awareness.setLocalStateField(key, value);
  }

  subscribe(dispatch: Dispatch, callback: RecvTransformCallback) {
    const unsub1 = this.subscribeTransformData(callback);
    const unsub2 = this.subscribeDisconnect(dispatch);
    const unsub3 = this.subscribeIdentityData(dispatch);
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }

  subscribeTransformData(callback: RecvTransformCallback) {
    // Update participants' transform data (position, rotation, etc.)
    const observer = () => {
      const states = this.worldDoc.provider.awareness.getStates();

      transformArray.length = 0;
      for (let state of states.values()) {
        if ("m" in state) {
          transformArray.push(state["m"]);
        }
      }
      callback(transformArray);
    };

    this.awareness.on("update", observer);

    return () => {
      this.awareness.off("update", observer);
    };
  }

  subscribeDisconnect(dispatch: Dispatch) {
    // Remove participant avatars when they disconnect
    const observer = (changes) => {
      for (let id of changes.removed) {
        dispatch({ id: "removeParticipant", clientId: id });
      }
    };

    this.worldDoc.provider.awareness.on("change", observer);

    return () => {
      this.worldDoc.provider.awareness.off("change", observer);
    };
  }

  subscribeIdentityData(dispatch: Dispatch) {
    for (let [participantId, identityData] of this.yidentities.entries()) {
      dispatch({
        id: "recvParticipantData",
        participantId,
        identityData,
        isLocal: participantId === playerId,
      });
    }
    const observer = (
      event: Y.YMapEvent<IdentityData>,
      transaction: Y.Transaction
    ) => {
      withMapEdits(event, {
        onAdd: (participantId, identityData) =>
          dispatch({
            id: "recvParticipantData",
            participantId,
            identityData,
            isLocal: transaction.local,
          }),
        onUpdate: (participantId, identityData, _oldIdentityData) =>
          dispatch({
            id: "recvParticipantData",
            participantId,
            identityData,
            isLocal: transaction.local,
          }),
        onDelete: (participantId, _identityData) => {
          throw Error(
            `remove by participantId unimplemented (${participantId})`
          );
        },
      });
    };

    this.yidentities.observe(observer);

    return () => {
      this.yidentities.unobserve(observer);
    };
  }
}
