import type { IdentityData } from "~/types";

import * as Y from "yjs";

import { withMapEdits } from "relm-common/yrelm";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { Dispatch } from "~/main/ProgramTypes";

/**
 * An adapter between the WorldDoc's "identities" map (Yjs) and
 * our participant-focused functional reactive runtime.
 */
export class ParticipantYBroker {
  worldDoc: WorldDoc;
  unsubs: Function[];

  constructor(worldDoc: WorldDoc) {
    this.worldDoc = worldDoc;
    this.unsubs = [];
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

  setField(key, value) {
    this.awareness.setLocalStateField(key, value);
  }

  getField(key) {
    return this.awareness.getLocalState()[key];
  }

  subscribe(dispatch: Dispatch) {
    this.unsubs.push(this.subscribeDisconnect(dispatch));
    this.unsubs.push(this.subscribeIdentityData(dispatch));
  }

  unsubscribe() {
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs.length = 0;
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
      });
    }
    const observer = (
      event: Y.YMapEvent<IdentityData>,
      transaction: Y.Transaction
    ) => {
      withMapEdits(event, {
        onAdd: (participantId, identityData) => {
          dispatch({
            id: "recvParticipantData",
            participantId,
            identityData,
          });
        },
        onUpdate: (participantId, identityData, _oldIdentityData) => {
          dispatch({
            id: "recvParticipantData",
            participantId,
            identityData,
          });
        },
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
