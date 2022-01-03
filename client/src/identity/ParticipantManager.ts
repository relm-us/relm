import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import { WorldDoc } from "~/y-integration/WorldDoc";
import { runtime } from "~/utils/runtime";
import { playerId } from "./playerId";

import { makeProgram } from "./Program";
import { Dispatch } from "~/main/ProgramTypes";
import { participantToTransformData } from "./Avatar/transform";
import { Appearance, Participant } from "./types";
import { ParticipantYBroker } from "./ParticipantYBroker";

export class ParticipantManager {
  dispatch: Dispatch;
  broker: ParticipantYBroker;
  participants: Map<string, Participant>;

  get local(): Participant {
    return this.participants.get(playerId);
  }

  get active(): Participant[] {
    // TODO
    return [];
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

  init() {}

  deinit() {}

  sendMyTransformData() {
    if (!this.local.avatar) return;

    const transformData = participantToTransformData(this.local);
    this.broker.setAwareness("m", transformData);
  }

  getAppearance(): Appearance {
    return this.local.identityData.appearance;
  }
  setAppearance(appearance: Appearance) {
    console.log("PM.setAppearance", appearance);
    this.dispatch({
      id: "participantMessage",
      message: {
        id: "sendParticipantData",
        participantId: playerId,
        updateData: { appearance },
      },
    });
  }

  getName(): string {
    return this.local.identityData.name;
  }
  setName(name: string) {
    console.log("PM.setName", name);
    this.dispatch({
      id: "participantMessage",
      message: {
        id: "sendParticipantData",
        participantId: playerId,
        updateData: { name },
      },
    });
  }

  toggleMic() {
    console.log("PM.toggleMic");
    const showAudio = !this.local.identityData.showAudio;
    this.dispatch({
      id: "participantMessage",
      message: {
        id: "sendParticipantData",
        participantId: playerId,
        updateData: { showAudio },
      },
    });
  }
}
