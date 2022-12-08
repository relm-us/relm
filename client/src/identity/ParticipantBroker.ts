import type { Awareness } from "relm-common";

import { EventEmitter } from "eventemitter3";

import { participantId } from "./participantId";
import { portalOccupancy } from "~/stores/portalOccupancy";

/**
 * A data broker that distinguishes between slow ("occasional") updates, and
 * fast (small and timely) data. Uses two Awareness objects, one for each mode.
 */
export class ParticipantBroker extends EventEmitter {
  slow: Awareness;
  rapid: Awareness;
  subscribed: boolean = false;
  unsubs: Function[];
  participantIds: Map<number, string> = new Map();

  get slowValues() {
    return this.slow.getStates().values();
  }

  get rapidValues() {
    return this.rapid.getStates().values();
  }

  constructor(slow: Awareness, rapid: Awareness) {
    super();

    this.slow = slow;
    this.slow.setLocalStateField("id", participantId);

    this.rapid = rapid;
    this.rapid.setLocalStateField("id", participantId);

    this.unsubs = [];
  }

  setField(key, value) {
    this.slow.setLocalStateField(key, value);
  }

  getField(key) {
    return this.slow.getLocalState()[key];
  }

  setRapidField(key, value) {
    this.rapid.setLocalStateField(key, value);
  }

  getRapidField(key) {
    return this.rapid.getLocalState()[key];
  }

  subscribe() {
    if (this.subscribed) {
      console.warn("already subscribed to ParticipantBroker");
      return;
    }

    // At the moment we subscribe, there may be some "state" that has
    // already been queued up that we need to announce
    for (let [clientId, state] of this.slow.getStates().entries()) {
      this.maybeEmitState(clientId, state);
    }

    const observer = (changes) => {
      for (let id of changes.removed) {
        if (this.participantIds.has(id)) {
          this.emit("remove", this.participantIds.get(id));
          this.participantIds.delete(id);
        } else {
          console.warn("client removed, without knowing its participantId", id);
        }
      }

      const idsToCheck = changes.added.concat(changes.updated);
      for (const clientId of idsToCheck) {
        const state = this.slow.getStates().get(clientId);
        this.maybeEmitState(clientId, state);
      }
    };

    this.slow.on("change", observer);

    this.unsubs.push(() => this.slow.off("change", observer));

    this.subscribed = true;

    return this;
  }

  maybeEmitState(clientId: number, state) {
    const stateParticipantId = state["id"];
    const stateIdentityData = state["identity"];
    if (state["type"] === "portals") {
      portalOccupancy.set(state["occupancy"]);
    } else if (stateParticipantId === participantId) {
      // Don't broadcast self state
    } else if (stateParticipantId && stateIdentityData) {
      if (!this.participantIds.has(clientId)) {
        this.emit("add", stateParticipantId, stateIdentityData);
        this.participantIds.set(clientId, stateParticipantId);
      } else {
        this.emit("update", stateParticipantId, stateIdentityData);
      }
    } else {
      console.log("state missing data, skipping", state);
    }
  }

  unsubscribe() {
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs.length = 0;
    this.subscribed = false;
  }
}
