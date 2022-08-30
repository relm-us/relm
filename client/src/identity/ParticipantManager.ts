import type {
  DecoratedECSWorld,
  Participant,
  UpdateData,
} from "~/types";

import { WebsocketProvider, Appearance, Equipment } from "relm-common";

import { participantId } from "./participantId";

import { Dispatch } from "~/main/ProgramTypes";
import {
  avatarGetAnimationData,
  avatarGetTransformData,
  setDataOnParticipant,
} from "./Avatar/transform";
import { ParticipantYBroker } from "./ParticipantYBroker";
import { isEqual } from "~/utils/isEqual";

export class ParticipantManager {
  dispatch: Dispatch;
  broker: ParticipantYBroker;
  participants: Map<string, Participant>;

  get local(): Participant {
    return this.participants.get(participantId);
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

  getByClientIds(clientIds: Iterable<number>): Participant[] {
    let participants = [];
    for (let clientId of clientIds) {
      const participant = this.getByClientId(clientId);
      if (participant) participants.push(participant);
    }
    return participants;
  }

  getByClientId(clientId: number): Participant {
    let matchingParticipant;
    for (let participant of this.participants.values()) {
      if (participant.identityData.clientId === clientId) {
        matchingParticipant = participant;
        break;
      }
    }
    return matchingParticipant;
  }

  sendMyState() {
    const state = this.broker.awareness.getLocalState();
    if (!state) return;

    const avatar = this.local.avatar;
    if (!this.local.avatar) return;

    const transformData = avatarGetTransformData(avatar);
    const animationData = avatarGetAnimationData(avatar);

    const changeDetected = (state["id"] !== participantId)
      || (!isEqual(state["i"], this.local.identityData))
      || (!isEqual(state["a"], animationData))
      || (!isEqual(state["t"], transformData));
    
    // Only send a new awareness update if a change is detected.
    if (changeDetected) {
      this.broker.setFields({
        "id": participantId,
        "i": this.local.identityData,
        "a": animationData,
        "t": transformData,
        "user": { // For QuillJS
          name: this.local.identityData.name,
          color: this.local.identityData.color
        }
      }); 
    }
  }

  applyOthersState(world: DecoratedECSWorld, provider: WebsocketProvider) {
    const states = provider.awareness.getStates();

    for (let state of states.values()) {
      if (!("id" in state)) continue;
      if (state["id"] === participantId) continue;

      const participant: Participant = this.participants.get(state["id"]);
      if (!participant) continue;

      const transformData = state["t"];
      const animationData = state["a"];
      const identityData = state["i"];

      setDataOnParticipant(
        world,
        participant,
        transformData,
        animationData,
        identityData,
        (participant) => {
          this.dispatch({ id: "participantJoined", participant });
        }
      );
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

  setMic(showAudio: boolean) {
    this.updateMe({ showAudio });
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
  console.log("participantRemoveAvatar", participant.avatar);
  if (participant.avatar?.entities) {
    Object.values(participant.avatar.entities).forEach((entity) =>
      entity?.destroy()
    );
  }
  participant.avatar = null;
}
