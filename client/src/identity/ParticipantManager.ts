import type {
  Appearance,
  DecoratedECSWorld,
  Equipment,
  Participant,
  UpdateData,
} from "~/types";

import { WebsocketProvider } from "y-websocket";

import { playerId } from "./playerId";

import { Dispatch } from "~/main/ProgramTypes";
import {
  avatarToAnimationData,
  avatarToTransformData,
  setDataOnParticipant,
} from "./Avatar/transform";
import { ParticipantYBroker } from "./ParticipantYBroker";

export class ParticipantManager {
  dispatch: Dispatch;
  broker: ParticipantYBroker;
  participants: Map<string, Participant>;

  get local(): Participant {
    return this.participants.get(playerId);
  }

  get actives(): Participant[] {
    const participants = Array.from(this.participants.values());
    return participants.filter((p) => p.avatar && participantIsActive(p));
  }

  constructor(
    dispatch: Dispatch,
    broker: ParticipantYBroker,
    participants: Map<string, Participant>
  ) {
    this.dispatch = dispatch;
    this.broker = broker;
    this.participants = participants;
  }

  deinit() {
    for (let participant of this.participants.values()) {
      participant.avatar = null;
    }
    this.participants.clear();
  }

  sendMyState() {
    if (!this.broker.getField("id")) {
      this.broker.setField("id", playerId);
    }

    const avatar = this.local.avatar;
    if (!this.local.avatar) return;

    const transformData = avatarToTransformData(avatar);
    this.broker.setField("t", transformData);

    const animationData = avatarToAnimationData(avatar);
    const currClipIndex = this.broker.getField("a")?.clipIndex;
    if (animationData.clipIndex !== currClipIndex) {
      this.broker.setField("a", animationData);
    }

    const currName = this.broker.getField("user")?.name;
    const { name, color } = this.local.identityData;
    if (name !== currName) {
      // Set quill cursor name and color
      this.broker.setField("user", {
        name,
        color,
      });
    }
  }

  applyOthersState(world: DecoratedECSWorld, provider: WebsocketProvider) {
    const states = provider.awareness.getStates();

    for (let state of states.values()) {
      if (!("id" in state)) continue;

      const participantId = state["id"];
      if (participantId === playerId) continue;

      const participant: Participant = this.participants.get(participantId);
      if (!participant) continue;

      if ("t" in state && "a" in state) {
        const transformData = state["t"];
        const animationData = state["a"];

        setDataOnParticipant(
          world,
          participant,
          transformData,
          animationData,
          (participant) => {
            this.dispatch({ id: "participantJoined", participant });
          }
        );
      }
    }
  }

  updateMe(identityData: UpdateData) {
    this.dispatch({ id: "updateLocalIdentityData", identityData });
  }

  getAppearance(): Appearance {
    return this.local.identityData.appearance;
  }

  setAppearance(appearance: Appearance) {
    this.updateMe({ appearance });
  }

  setEquipment(equipment: Equipment) {
    this.updateMe({ equipment });
  }

  getName(): string {
    return this.local.identityData.name;
  }

  setName(name: string) {
    this.updateMe({ name });
  }

  setShowVideo(showVideo: boolean) {
    this.updateMe({ showVideo });
  }

  getCommunicatingState(state: "speaking" | "emoting") {
    return this.local.identityData[state];
  }

  setCommunicatingState(
    message: string,
    state: "speaking" | "emoting",
    value: boolean
  ) {
    this.updateMe({ [state]: value, message: value ? message : null });
  }

  toggleMic() {
    const showAudio = !this.local.identityData.showAudio;
    this.updateMe({ showAudio });
    return showAudio;
  }
}

const LONG_TIME_AGO = 600000; // 5 minutes ago
const LAST_SEEN_TIMEOUT = 5000; // 5 seconds ago

// Number of milliseconds since last seen
export function participantSeenAgo(
  this: void,
  participant: Participant
): number {
  const lastSeen = participant.lastSeen;
  return lastSeen === undefined
    ? LONG_TIME_AGO
    : performance.now() - participant.lastSeen;
}

export function participantIsActive(
  this: void,
  participant: Participant
): boolean {
  return participantSeenAgo(participant) < LAST_SEEN_TIMEOUT;
}

export function participantRemoveAvatar(this: void, participant: Participant) {
  if (participant.avatar?.entities) {
    Object.values(participant.avatar.entities).forEach((entity) =>
      entity?.destroy()
    );
  }
  participant.avatar = null;
}
