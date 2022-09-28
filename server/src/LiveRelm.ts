import { Observable } from "lib0/observable";
import { Awareness } from "relm-common";

export class LiveRelm extends Observable<string> {
  name: string;
  awareness: Awareness;
  participantIds: Set<string> = new Set();
  portals: Set<string> = new Set();

  get occupancy() {
    return this.participantIds.size;
  }

  constructor(name: string, awareness?: Awareness) {
    super();

    this.name = name;
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
    this.participantIds.add(participantId);
    console.log(
      `'${this.name}' now has ${this.occupancy} ` +
        `participants ('${participantId}' joined)`
    );
  }

  leave(participantId: string) {
    this.participantIds.delete(participantId);
    console.log(
      `'${this.name}' now has ${this.occupancy} ` +
        `participants ('${participantId}' left)`
    );
  }
}

export const liveRelms = new Map<string, LiveRelm>();

export function getOrCreateLiveRelm(name: string, awareness?: Awareness) {
  if (!liveRelms.has(name)) liveRelms.set(name, new LiveRelm(name, awareness));
  return liveRelms.get(name);
}
