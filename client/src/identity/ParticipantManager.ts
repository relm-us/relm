import { playerId } from "./playerId";

import { Dispatch } from "~/main/ProgramTypes";
import { participantToTransformData } from "./Avatar/transform";
import { Appearance, Participant, UpdateData } from "./types";
import { ParticipantYBroker } from "./ParticipantYBroker";
import { updateLocalParticipant } from "~/main/effects/updateLocalParticipant";

export class ParticipantManager {
  dispatch: Dispatch;
  broker: ParticipantYBroker;
  participants: Map<string, Participant>;
  // activeCache: Participant[] = [];

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

  sendMyTransformData() {
    if (!this.local.avatar) return;

    const transformData = participantToTransformData(this.local);
    this.broker.setAwareness("m", transformData);
  }

  updateMe(updateData: UpdateData) {
    updateLocalParticipant(this.local, updateData)(this.dispatch);
  }

  getAppearance(): Appearance {
    return this.local.identityData.appearance;
  }

  setAppearance(appearance: Appearance) {
    this.updateMe({ appearance });
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

  toggleMic() {
    const showAudio = !this.local.identityData.showAudio;
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
  if (participant.avatar?.entities) {
    Object.values(participant.avatar.entities).forEach((entity) =>
      entity?.destroy()
    );
  }
  participant.avatar = null;
}
