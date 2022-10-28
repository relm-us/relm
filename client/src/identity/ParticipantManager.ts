import type {
  DecoratedECSWorld,
  IdentityData,
  Participant,
  ParticipantMap,
  UpdateData,
} from "~/types";

import { Readable, Writable, writable, get as getStore } from "svelte/store";
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
import { AVConnection } from "~/av";

const logEnabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("participant");

export class ParticipantManager {
  dispatch: Dispatch;
  broker: ParticipantBroker;
  avConnection: AVConnection;
  unsubs: Function[] = [];

  _store: Writable<ParticipantMap>;

  get participants(): Participant[] {
    return Array.from(getStore(this._store).values());
  }

  get store(): Readable<ParticipantMap> {
    return this._store;
  }

  get local(): Participant {
    return this.get(participantId);
  }

  get(participantId): Participant {
    const map = getStore(this._store);
    if (map?.get) return map.get(participantId);
    else console.warn("can't get participant", map);
    // return getStore(this._store).get(participantId);
  }

  set(participantId, participant: Participant) {
    this._store.update(($map) => {
      $map.set(participantId, participant);
      return $map;
    });
    console.log("set map", getStore(this._store));
  }

  constructor(
    dispatch: Dispatch,
    broker: ParticipantBroker,
    avConnection: AVConnection,
    participants: ParticipantMap
  ) {
    this.dispatch = dispatch;
    this.broker = broker;
    this.avConnection = avConnection;

    this._store = writable(participants);
  }

  init() {
    this.listen("add", this.addParticipant.bind(this));
    this.listen("update", this.updateParticipant.bind(this));
    this.listen("remove", this.removeParticipant.bind(this));

    return this;
  }

  deinit() {
    for (let participant of this.participants.values()) {
      this.deinitParticipant(participant);
    }

    this._store.update(($map) => {
      $map.clear();
      return $map;
    });
  }

  listen(signal: string, fn) {
    this.broker.on(signal, fn);
    this.unsubs.push(() => this.broker.off(signal, fn));
  }

  sendMyRapidData() {
    if (this.local?.avatar) {
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

      const participant: Participant = this.get(state["id"]);
      if (!participant) continue;

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

  setMic(showAudio: boolean) {
    this.updateMe({ showAudio });

    // In addition to not showing the audio, actually disable it
    const adapter = this.avConnection.adapter;
    if (showAudio) adapter.enableMic();
    else adapter.disableMic();
  }

  toggleMic() {
    const showAudio = !this.local.identityData.showAudio;
    this.setMic(showAudio);
    return showAudio;
  }

  setVideo(showVideo: boolean) {
    this.updateMe({ showVideo });

    // In addition to not showing the video, actually disable it
    const adapter = this.avConnection.adapter;
    if (showVideo) adapter.enableCam();
    else adapter.disableCam();
  }

  toggleVideo() {
    const showVideo = !this.local.identityData.showVideo;
    this.setVideo(showVideo);
    return showVideo;
  }

  addParticipant(participantId: string, identityData: IdentityData) {
    const participant: Participant = {
      participantId: participantId,
      identityData: identityData,
      editable: false, // can't edit other participants
      modified: true,
    };

    this.set(participantId, participant);

    this.dispatch({ id: "participantJoined", participant });

    return participant;
  }

  updateParticipant(participantId: string, identityData: IdentityData) {
    const participant = this.get(participantId);

    participant.identityData = identityData;
    participant.modified = true;

    return participant;
  }

  deinitParticipant(participant: Participant) {
    if (participant.avatar) {
      Object.values(participant.avatar.entities).forEach((entity) =>
        entity?.destroy()
      );
      participant.avatar = null;
    }
  }

  removeParticipant(participantId) {
    this.deinitParticipant(this.get(participantId));

    // Remove participant from svelte store
    this._store.update(($map) => {
      $map.delete(participantId);
      return $map;
    });

    this.dispatch({ id: "participantLeft", participantId });
  }
}
