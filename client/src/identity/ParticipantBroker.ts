import type { IdentityData } from "~/types";

import { writable, Writable, get } from "svelte/store";
import { Awareness } from "y-protocols/awareness";

import { Dispatch } from "~/main/ProgramTypes";
import { isEqual } from "~/utils/isEqual";
import { GeckoProvider } from "./GeckoProvider";

/**
 * A broker between the participant and the underlying means of transporting data
 * to the server:
 * - slow data goes over yjs websocket (via Awareness)
 * - fast data goes over gecko webrtc (UDP)
 */
export class ParticipantBroker {
  awareness: Awareness;
  gecko: GeckoProvider;
  unsubs: Function[];
  clients: Writable<Map<number, IdentityData>>;

  constructor(awareness: Awareness, gecko: GeckoProvider) {
    this.awareness = awareness;
    this.gecko = gecko;
    this.unsubs = [];
    this.clients = writable(new Map());
  }

  setField(key, value) {
    this.awareness.setLocalStateField(key, value);
  }

  setFields(data) {
    this.awareness.setLocalState({
      ...this.awareness.getLocalState(),
      ...data,
    });
  }

  getField(key) {
    return this.awareness.getLocalState()[key];
  }

  subscribe(dispatch: Dispatch) {
    this.unsubs.push(this.subscribeData(dispatch));
    this.unsubs.push(this.subscribeDisconnect(dispatch));
  }

  unsubscribe() {
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs.length = 0;
  }

  subscribeGecko() {}

  subscribeData(dispatch: Dispatch) {
    const observer = (changes) => {
      const idsToCheck = changes.added.concat(changes.updated);
      for (const id of idsToCheck) {
        // Don't subscribe to self data
        if (id === this.awareness.clientID) continue;

        const state = this.awareness.getStates().get(id);

        const participantId = state["id"];
        const identityData = state["i"];

        if (!participantId || !identityData) continue;

        // Update identity data as necessary
        if (!isEqual(get(this.clients).get(id), identityData)) {
          this.clients.update(($clients) => {
            $clients.set(id, identityData);
            return $clients;
          });

          dispatch({
            id: "recvParticipantData",
            participantId,
            identityData,
          });
        }
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
}
