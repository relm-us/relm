import * as time from "lib0/time";
import * as f from "lib0/function";
import * as awarenessProtocol from "y-protocols/awareness";

export class LocalState {

  private awareness: awarenessProtocol.Awareness;
  private clientId: number;

  constructor(clientId: number, awareness: awarenessProtocol.Awareness) {
    this.clientId = clientId;
    this.awareness = awareness;
  }

  getLocalState() {
    return this.awareness.states.get(this.clientId) || null;
  }

  setLocalState(state: any) {
    const clientID = this.clientId;
    const currLocalMeta = this.awareness.meta.get(clientID);
    const clock = currLocalMeta === undefined ? 0 : currLocalMeta.clock + 1;
    const prevState = this.awareness.states.get(clientID);

    if (state === null) {
      this.awareness.states.delete(clientID);
    } else {
      this.awareness.states.set(clientID, state);
    }
    this.awareness.meta.set(clientID, {
      clock,
      lastUpdated: time.getUnixTime()
    });
    const added = [];
    const updated = [];
    const filteredUpdated = [];
    const removed = [];
    if (state === null) {
      removed.push(clientID);
    } else if (prevState == null) {
      if (state != null) {
        added.push(clientID);
      }
    } else {
      updated.push(clientID);
      if (!f.equalityDeep(prevState, state)) {
        filteredUpdated.push(clientID);
      }
    }
    if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
      this.awareness.emit('change', [{ added, updated: filteredUpdated, removed }, 'local']);
    }
    this.awareness.emit('update', [{ added, updated, removed }, 'local']);
  }

  getLocalField(field: string) {
    const state = this.getLocalState();
    if (state !== null) {
      return state[field];
    }
  }

  setLocalField(field: string, value: any) {
    const state = this.getLocalState();
    if (state !== null) {
      this.setLocalState({
        ...state,
        [field]: value
      });
    }
  }

}