import { Observable } from "lib0/observable";
import { Awareness } from "relm-common";

import { createVisit } from "./db/visit.js";
import { type RelmDocWithName } from "./db/doc.js";

export class LiveRelm extends Observable<string> {
  relmId: string;
  relmName: string;
  awareness: Awareness;
  participantIds: Set<string> = new Set();
  portals: Set<string> = new Set();

  get occupancy() {
    return this.participantIds.size;
  }

  constructor(relmId: string, relmName: string, awareness?: Awareness) {
    super();

    this.relmId = relmId;
    this.relmName = relmName;
    this.awareness = awareness;
  }

  setPortals(portals: string[]) {
    this.portals = new Set(Array.from(portals));
  }

  // If awareness is available, send the occupancy map
  send() {
    this.awareness?.setLocalState({
      type: "portals",
      occupancy: this.getOccupancyMap(),
    });
  }

  getOccupancyMap() {
    const map: Record<string, number> = {};
    for (let portalName of this.portals.values()) {
      const portal = liveRelms.get(portalName);
      if (portal) map[portalName] = portal.occupancy;
    }
    return map;
  }

  join(participantId: string) {
    createVisit({ relmId: this.relmId, participantId });
    this.participantIds.add(participantId);
    console.log(
      `'${this.relmName}' now has ${this.occupancy} ` +
        `participants ('${participantId}' joined)`
    );
  }

  leave(participantId: string) {
    this.participantIds.delete(participantId);
    console.log(
      `'${this.relmName}' now has ${this.occupancy} ` +
        `participants ('${participantId}' left)`
    );
  }
}

export const liveRelms = new Map<string, LiveRelm>();

export function getOrCreateLiveRelm(
  relmDoc: RelmDocWithName,
  awareness?: Awareness
) {
  if (!liveRelms.has(relmDoc.relmId))
    liveRelms.set(
      relmDoc.relmId,
      new LiveRelm(relmDoc.relmId, relmDoc.relmName, awareness)
    );
  return liveRelms.get(relmDoc.relmId);
}
