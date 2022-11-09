import type {
  ActionState,
  DecoratedECSWorld,
  IdentityData,
  Participant,
  ParticipantMap,
  UpdateData,
} from "~/types";

import { Readable, Writable, writable, get as getStore } from "svelte/store";
import { Appearance, Equipment } from "relm-common";

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
import { ControllerState, Repulsive } from "~/ecs/plugins/player-control";
import {
  CHAIR_SIT,
  COLLIDER_HEIGHT_SIT_CHAIR,
  COLLIDER_HEIGHT_STAND,
  OCULUS_HEIGHT_SIT_CHAIR,
  OCULUS_HEIGHT_SIT_GROUND,
  OCULUS_HEIGHT_STAND,
  RAISING_HAND,
  STAND_SIT,
  WAVING,
} from "~/config/constants";
import { Oculus } from "~/ecs/plugins/html2d";
import { Model2 } from "~/ecs/plugins/model";
import { Transform } from "~/ecs/plugins/core";
import { Collider2 } from "~/ecs/plugins/collider";
import { inFrontOf } from "~/utils/inFrontOf";

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
  }

  set(participantId, participant: Participant) {
    this._store.update(($map) => {
      $map.set(participantId, participant);
      return $map;
    });
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
        if (participant.modifiedIdentityData)
          maybeMakeAvatar(world, participant, transformData);
        avatarSetTransformData(participant.avatar, transformData);
      } else if (logEnabled && Math.random() < 0.04) {
        console.log("no transform data from other participant", state["id"]);
        return;
      }

      if (participant.modifiedIdentityData && participant.avatar) {
        setAvatarFromParticipant(participant);
        participant.modifiedIdentityData = false;
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

  setAction(action: ActionState) {
    const body = this.local.avatar?.entities.body;
    if (!body) {
      console.log("Unable to set action, avatar not initialized");
      return;
    }

    this.local.actionState = action;

    const controller: ControllerState = body.get(ControllerState);
    const oculus: Oculus = body.get(Oculus);

    switch (action.state) {
      case "free": {
        controller.animOverride = null;
        oculus.targetOffset.y = OCULUS_HEIGHT_STAND;
        this.setRepulsive(true);
        this.setModelOffset(0);
        this.setColliderHeight(COLLIDER_HEIGHT_STAND);
        break;
      }

      case "waving": {
        controller.animOverride = { clipName: WAVING, loop: true };
        oculus.targetOffset.y = OCULUS_HEIGHT_STAND;
        this.setRepulsive(true);
        this.setModelOffset(0);
        this.setColliderHeight(COLLIDER_HEIGHT_STAND);
        break;
      }

      case "raise-hand": {
        controller.animOverride = { clipName: RAISING_HAND, loop: false };
        oculus.targetOffset.y = OCULUS_HEIGHT_STAND;
        this.setRepulsive(true);
        this.setModelOffset(0);
        this.setColliderHeight(COLLIDER_HEIGHT_STAND);
        break;
      }

      case "sit-ground": {
        controller.animOverride = { clipName: STAND_SIT, loop: false };
        oculus.targetOffset.y = OCULUS_HEIGHT_SIT_GROUND;
        this.setRepulsive(false);
        this.setModelOffset(0);
        this.setColliderHeight(COLLIDER_HEIGHT_STAND);
        break;
      }

      case "sit-chair": {
        const transform = body.get(Transform);

        transform.position.copy(action.position);
        transform.rotation.copy(action.rotation);

        controller.animOverride = { clipName: CHAIR_SIT, loop: false };
        oculus.targetOffset.y = OCULUS_HEIGHT_SIT_CHAIR;

        this.setRepulsive(false);

        // Center on the seated rear end, rather than the feet
        this.setModelOffset(2);

        // Adjust avatar's collider so that it rests on rear end
        this.setColliderHeight(COLLIDER_HEIGHT_SIT_CHAIR);
        break;
      }

      case "leave-chair": {
        const transform = body.get(Transform);
        const position = inFrontOf(transform.position, transform.rotation, 0.6);
        transform.position.copy(position);

        controller.animOverride = null;
        oculus.targetOffset.y = OCULUS_HEIGHT_STAND;
        this.setModelOffset(0);
        this.setColliderHeight(COLLIDER_HEIGHT_STAND);

        this.setAction({ state: "free" });
        break;
      }
    }
  }

  setRepulsive(enabled: boolean) {
    const body = this.local.avatar?.entities.body;
    if (enabled) {
      console.log("add repulsive");
      body.add(Repulsive);
    } else {
      console.log("remove repulsive");
      body.remove(Repulsive);
    }
  }

  setModelOffset(z: number) {
    const model: Model2 = this.local.avatar?.entities.body.get(Model2);
    if (model && model.offset.z !== z) {
      model.offset.z = z;
      model.modified();
    }
  }

  setColliderHeight(height: number) {
    const collider: Collider2 = this.local.avatar?.entities.body.get(Collider2);
    if (collider && collider.size.y !== height) {
      collider.size.y = height;
      collider.modified();
    }
  }

  get currentAction() {
    return this.local.actionState.state;
  }

  addParticipant(participantId: string, identityData: IdentityData) {
    const participant: Participant = {
      participantId: participantId,
      editable: false, // can't edit other participants

      identityData: identityData,
      modifiedIdentityData: true,

      actionState: { state: "free" },
      modifiedActionState: false,
    };

    this.set(participantId, participant);

    this.dispatch({ id: "participantJoined", participant });

    return participant;
  }

  updateParticipant(participantId: string, identityData: IdentityData) {
    const participant = this.get(participantId);

    participant.identityData = identityData;
    participant.modifiedIdentityData = true;

    return participant;
  }

  deinitParticipant(participant: Participant) {
    if (participant?.avatar) {
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
