import type { IdentityData } from "~/types";

import * as Y from "yjs";
import { writable, Writable, get } from "svelte/store";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { Dispatch } from "~/main/ProgramTypes";
import { isEqual } from "~/utils/isEqual";

/**
 * An adapter between the WorldDoc's "identities" map (Yjs) and
 * our participant-focused functional reactive runtime.
 */
export class ParticipantYBroker {
  worldDoc: WorldDoc;
  unsubs: Function[];
  clients: Writable<Map<number, IdentityData>>;

  constructor(worldDoc: WorldDoc) {
    this.worldDoc = worldDoc;
    this.unsubs = [];
    this.clients = writable(new Map());
  }

  get yidentities(): Y.Map<IdentityData> {
    return this.worldDoc.ydoc.getMap("identities");
  }

  get awareness() {
    return this.worldDoc.provider.awareness;
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
          $clients.set(id, null);
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
    for (const state of this.awareness.getStates().values()) {
      if (("id" in state) && ("identity" in state)) {
        const participantId = state["id"];
        const identityData = state["identity"];

        dispatch({
          id: "recvParticipantData",
          participantId,
          identityData
        });
      }
    }

    const observer = changes => {
      const idsToCheck = changes.added.concat(changes.updated);
      for (const id of idsToCheck) {
        const state = this.awareness.getStates().get(id);

        if (("id" in state) && ("identity" in state)) {
          const participantId = state["id"];
          const identityData = state["identity"];
          
          // Update identity data as necessary
          if (!isEqual(get(this.clients).get(id), identityData)) {
            this.clients.update($clients => {
              $clients.set(id, identityData);
              return $clients;
            });

            dispatch({
              id: "recvParticipantData",
              participantId,
              identityData
            });
          }
        }


      }
    };

    this.awareness.on("change", observer);

    return () => this.awareness.off("change", observer);
  }
}
