import type {
  DecoratedECSWorld,
  IdentityData,
  Participant,
  UpdateData,
} from "~/types";

import { Appearance, Equipment } from "relm-common";
import filter from "lodash/filter";

import { participantId } from "./participantId";

import { Dispatch } from "~/main/ProgramTypes";
import {
  avatarGetTransformData,
  avatarSetTransformData,
  maybeMakeAvatar,
} from "./Avatar/transform";
import { ParticipantBroker } from "./ParticipantBroker";
import { setAvatarFromParticipant } from "./Avatar";
import { Readable, Writable, writable } from "svelte/store";

const logEnabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("participant");

export class ParticipantManager {
  dispatch: Dispatch;
  broker: ParticipantBroker;
  participants: Map<string, Participant>;
  unsubs: Function[] = [];

  _store: Writable<Participant[]>;

  get store(): Readable<Participant[]> {
    return this._store;
  }

  get local(): Participant {
    return this.participants.get(participantId);
  }

  get actives(): Participant[] {
    const participants = Array.from(this.participants.values());
    return participants.filter((p) => p.avatar && participantIsActive(p));
  }

  constructor(
    dispatch: Dispatch,
    broker: ParticipantBroker,
    participants: Map<string, Participant>
  ) {
    this.dispatch = dispatch;
    this.broker = broker;
    this.participants = participants;

    this._store = writable(Array.from(participants.values()));
  }

  init() {
    this.listen("add", this.addParticipant.bind(this));
    this.listen("update", this.updateParticipant.bind(this));
    this.listen("remove", this.removeParticipant.bind(this));

    return this;
  }

  deinit() {
    for (let participant of this.participants.values()) {
      participant.avatar = null;
    }
    this.participants.clear();
  }

  listen(signal: string, fn) {
    this.broker.on(signal, fn);
    this.unsubs.push(() => this.broker.off(signal, fn));
  }

  sendMyRapidData() {
    if (this.local.avatar) {
      if (logEnabled && Math.random() < 0.04) {
        console.log("sending my rapid data", participantId);
      }
      this.broker.setRapidField("t", avatarGetTransformData(this.local.avatar));
    }
  }

  applyOthersRapidData(world: DecoratedECSWorld) {
    for (let state of this.broker.rapidValues) {
      if (!("id" in state)) continue;
      if (state["id"] === participantId) continue;

      const participant: Participant = this.participants.get(state["id"]);
      if (!participant) continue;

      // Record that we've seen this participant now, so we can know which
      // participants are currently active
      participant.lastSeen = performance.now();

      const transformData = state["t"];

      if (transformData) {
        if (logEnabled && Math.random() < 0.04)
          console.log("applying rapid data to other", state["id"]);
        if (participant.modified)
          maybeMakeAvatar(world, participant, transformData);
        avatarSetTransformData(participant.avatar, transformData);
      } else if (logEnabled && Math.random() < 0.04) {
        console.log("no transform data from other participant", state["id"]);
        return;
      }

      if (participant.modified && participant.avatar) {
        setAvatarFromParticipant(participant);
        participant.modified = false;
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

  getColor(): string {
    return this.local.identityData.color;
  }

  setColor(color: string) {
    this.updateMe({ color });
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

  addParticipant(participantId: string, identityData: IdentityData) {
    const participant: Participant = {
      participantId: participantId,
      identityData: identityData,
      editable: false, // can't edit other participants
      modified: true,
    };

    this.participants.set(participantId, participant);

    // Add participant to svelte store
    this._store.update(($participants) => [...$participants, participant]);

    this.dispatch({ id: "participantJoined", participant });

    return participant;
  }

  updateParticipant(participantId: string, identityData: IdentityData) {
    const participant = this.participants.get(participantId);

    participant.identityData = identityData;
    participant.modified = true;

    return participant;
  }

  removeParticipant(participantId) {
    const participant = this.participants.get(participantId);

    if (participant.avatar) {
      Object.values(participant.avatar.entities).forEach((entity) =>
        entity?.destroy()
      );
      participant.avatar = null;
    }

    // Remove participant from svelte store
    this._store.update(($participants) =>
      filter(
        $participants,
        (p: Participant) => p.participantId === participantId
      )
    );

    this.dispatch({ id: "participantLeft", participantId });
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
