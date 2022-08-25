import { RelmProvider } from "relm-common";
import { LocalState } from "./LocalState.js";

export type ParticipantOptions = {
  clientId: number,
  participantId: string,
  name: string,
  provider: RelmProvider
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
  private tcpState: LocalState;
  private udpState: LocalState;

  constructor(options: ParticipantOptions) {
    this.options = options;
    this.tcpState = new LocalState(options.clientId, options.provider.ws.awareness);
    // this.udpState = new LocalState(options.clientId, options.provider.gecko.awareness);
  }

  join() {
    // Find entry way to spawn at.
    const [spawnX, spawnY, spawnZ] = this.getSpawnPos();

    // Broadcast our spawning to other players
    this.options.provider.ws.awareness.states.set(this.options.clientId, {});
    // this.options.provider.gecko.awareness.states.set(this.options.clientId, {});

    this.tcpState.setLocalField("id", this.options.participantId);
    this.tcpState.setLocalField("user", { color: randomColor(), name: this.options.name });
    this.tcpState.setLocalField("i", this.getBotIdentityData());

    this.udpState.setLocalField("id", this.options.participantId);
    this.udpState.setLocalField("a", { clipIndex: 2, animLoop: true });

    this.setTransform([spawnX, spawnY, spawnZ, 0, 0, 0]);
  }

  getSpawnPos() {
    return (this.options.provider.ws.awareness.doc.getMap("entryways").get("default") || [0, 0, 0]) as number[];
  }

  getTransform() {
    return this.udpState.getLocalField("t");
  }

  setTransform(transform: number[]) {
    this.udpState.setLocalField("t", transform);
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