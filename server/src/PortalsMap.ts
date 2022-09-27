import { Observable } from "lib0/observable";

import { difference } from "./utils/set.js";

export class PortalsMap extends Observable<string> {
  /**
   * Each relmName tracks the number of participants in attendance
   *
   * string - relmName
   * Set<string> - a set of remote (outgoing) portals (also names of relms)
   */
  portals = new Map<string, Set<string>>();

  maybeInit(relmName: string) {
    if (!this.portals.has(relmName)) {
      this.portals.set(relmName, new Set());
    }
  }

  set(relmName: string, remotes: string[]) {
    this.maybeInit(relmName);
    const oldSet = this.portals.get(relmName);
    const newSet = new Set(remotes);

    const added = difference(newSet, oldSet);
    const removed = difference(oldSet, newSet);

    console.log(`portals.set(${relmName}):`, Array.from(newSet));
    this.portals.set(relmName, newSet);

    if (added.size > 0) this.emit("add", [relmName, added, newSet]);
    if (removed.size > 0) this.emit("remove", [relmName, removed, newSet]);
    if (added.size > 0 || removed.size > 0) {
      this.emit("change", [relmName, newSet]);
    }
  }

  get(relmName: string) {
    return Array.from(this.portals.get(relmName) ?? []);
  }
}

export const portalsMap = new PortalsMap();
