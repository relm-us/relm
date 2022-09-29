import { worldManager } from "~/world";
import { Participant } from "~/types";
import { participantId } from "~/identity/participantId";

import { setAppearance } from "./appearance";
import { setEmoji } from "./emoji";
import { setOculus } from "./oculus";
import { setSpeech } from "./speech";
import { setEquipped } from "./equip";

function onDidEditName(name: string) {
  worldManager.participants.setName(name);
}

function onCloseSpeech() {
  worldManager.participants.setCommunicatingState(null, "speaking", false);
}

export function setAvatarFromParticipant(this: void, participant: Participant) {
  if (!participant) return;
  if (!participant.avatar)
    throw Error(`participant requires avatar: ${participant.participantId}`);

  const isLocal = participant.participantId === participantId;

  const entities = participant.avatar.entities;
  const data = participant.identityData;
  setAppearance(entities, data.appearance);
  setEquipped(entities, data.equipment);
  setEmoji(entities, data.emoji, data.emoting);
  setOculus(
    entities,
    participant.participantId,
    data.name,
    data.color,
    participant.editable && isLocal ? onDidEditName : null,
    data.showAudio,
    data.showVideo
  );
  setSpeech(
    entities,
    data.message,
    data.speaking,
    isLocal ? onCloseSpeech : null
  );

  return true;
}
