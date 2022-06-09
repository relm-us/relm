import type { IdentityData } from "~/types";

import * as Y from "yjs";
import { writable, Writable } from "svelte/store";

import { withMapEdits } from "relm-common";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { Dispatch } from "~/main/ProgramTypes";

/**
 * An adapter between the WorldDoc's "identities" map (Yjs) and
 * our participant-focused functional reactive runtime.
 */
export class ParticipantYBroker {
  worldDoc: WorldDoc;
  unsubs: Function[];
  clients: Writable<Set<number>>;

  constructor(worldDoc: WorldDoc) {
    this.worldDoc = worldDoc;
    this.unsubs = [];
    this.clients = writable(new Set());
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
    this.unsubs.push(this.subscribeConnect(dispatch));
    this.unsubs.push(this.subscribeDisconnect(dispatch));
    this.unsubs.push(this.subscribeIdentityData(dispatch));
  }

  unsubscribe() {
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs.length = 0;
  }

  subscribeConnect(dispatch: Dispatch) {
    console.log("subscribeConnect");
    const observer = (changes) => {
      for (let id of changes.added) {
        // Add clientId when they connect
        this.clients.update(($clients) => {
          $clients.add(id);
          return $clients;
        });
      }
    };
    this.awareness.on("change", observer);
    return () => this.awareness.off("change", observer);
  }

  subscribeDisconnect(dispatch: Dispatch) {
    const observer = (changes) => {
      for (let id of changes.removed) {
        this.clients.update(($clients) => {
          $clients.delete(id);
          return $clients;
        });
        // Remove participant avatars when they disconnect
        dispatch({ id: "removeParticipant", clientId: id });
      }
    };
    this.awareness.on("change", observer);
    return () => this.awareness.off("change", observer);
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
