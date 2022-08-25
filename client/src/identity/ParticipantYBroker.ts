import { isEqual } from "relm-common";
import type { IdentityData } from "~/types";

import { writable, Writable, get } from "svelte/store";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { Dispatch } from "~/main/ProgramTypes";

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

  get tcpAwareness() {
    return this.worldDoc.provider.ws.awareness;
  }

  setTCPField(key, value) {
    this.tcpAwareness.setLocalStateField(key, value);
  }

  setTCPFields(data) {
    this.tcpAwareness.setLocalState({
      ...this.tcpAwareness.getLocalState(),
      ...data
    });
  }

  getTCPField(key) {
    return this.tcpAwareness.getLocalState()[key];
  }

  setUDPField(key, value) {
    this.worldDoc.provider.gecko.setField(key, value);
  }

  setUDPFields(data) {
    this.worldDoc.provider.gecko.setFields({
      ...this.worldDoc.provider.gecko.getFields(),
      ...data
    });
  }

  getUDPField(key) {
    return this.worldDoc.provider.gecko.getField(key);
  }

  subscribe(dispatch: Dispatch) {
    this.unsubs.push(this.subscribeData(dispatch));
    this.unsubs.push(this.subscribeDisconnect(dispatch));
  }

  unsubscribe() {
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs.length = 0;
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

    this.tcpAwareness.on("change", observer);

    return () => this.tcpAwareness.off("change", observer);
  }

  subscribeData(dispatch: Dispatch) {
    const observer = (changes) => {
      const idsToCheck = changes.added.concat(changes.updated);
      for (const id of idsToCheck) {
        // Don't subscribe to self data
        if (id === this.tcpAwareness.clientID) continue;

        const state = this.tcpAwareness.getStates().get(id);

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

    this.tcpAwareness.on("change", observer);

    return () => this.tcpAwareness.off("change", observer);
  }
}
