import * as awarenessProtocol from "y-protocols/awareness";
import * as time from "lib0/time";
import * as f from "lib0/function";

export type ParticipantOptions = {
  clientId: number,
  participantId: string,
  name: string,
  awareness: awarenessProtocol.Awareness
};

const HEX_CHARS = "01234567890ABCDEF".split("");
function randomColor() {
  return `#${randomHexChar()}${randomHexChar()}${randomHexChar()}${randomHexChar()}${randomHexChar()}${randomHexChar()}`;
}

function randomHexChar() {
  return HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
}

// Represents 1 participant in the relm
// Bypasses the need to create a socket per participant by using the same awareness of an authenticated socket.
export class RelmParticipant {

  private options: ParticipantOptions;

  constructor(options: ParticipantOptions) {
    this.options = options;
  }

  join() {
    // Find entry way to spawn at.
    const [spawnX, spawnY, spawnZ] = this.getSpawnPos();

    // Register our identity to other clients
    const yIdentities = this.options.awareness.doc.getMap("identities");
    yIdentities.set(this.options.participantId, this.getBotIdentityData());

    // Broadcast our spawning to other players
    this.options.awareness.states.set(this.options.clientId, {});
    this.setLocalField("id", this.options.participantId);
    this.setLocalField("animation", { clipIndex: 2, animLoop: true });
    this.setLocalField("user", { color: randomColor(), name: this.options.name });
    this.setTransform([spawnX, spawnY, spawnZ, 0, 0, 0]);
  }

  getSpawnPos() {
    return (this.options.awareness.doc.getMap("entryways").get("default") || [0, 0, 0]) as number[];
  }

  getTransform() {
    return this.getLocalField("transform");
  }

  setTransform(transform: number[]) {
    this.setLocalField("transform", transform);
  }

  getLocalState() {
    return this.options.awareness.states.get(this.options.clientId) || null;
  }

  setLocalState(state: any) {
    const clientID = this.options.clientId;
    const currLocalMeta = this.options.awareness.meta.get(clientID);
    const clock = currLocalMeta === undefined ? 0 : currLocalMeta.clock + 1;
    const prevState = this.options.awareness.states.get(clientID);

    if (state === null) {
      this.options.awareness.states.delete(clientID);
    } else {
      this.options.awareness.states.set(clientID, state);
    }
    this.options.awareness.meta.set(clientID, {
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
      this.options.awareness.emit('change', [{ added, updated: filteredUpdated, removed }, 'local']);
    }
    this.options.awareness.emit('update', [{ added, updated, removed }, 'local']);
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

  private getBotIdentityData() {
    return {
      name: this.options.name,
      color: randomColor(),
      status: "present",
      speaking: false,
      emoting: false,
      showAudio: false,
      showVideo: false,
      appearance: {
        genderSlider: Math.random(),
        widthSlider: Math.random(),
        beard: false,
        belt: true,
        hair: "short",
        top: 4,
        bottom: 3,
        shoes: 3,
        skinColor: randomColor(),
        hairColor: randomColor(),
        topColor: randomColor(),
        bottomColor: randomColor(),
        beltColor: randomColor(),
        shoeColor: randomColor(),
      }
    };
  }

}