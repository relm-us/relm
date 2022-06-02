import { worldManager } from "~/world";
import { Participant } from "~/types";
import { playerId } from "~/identity/playerId";

import { setAppearance } from "./appearance";
import { setEmoji } from "./emoji";
import { setOculus } from "./oculus";
import { setSpeech } from "./speech";
import { chatOpen } from "~/stores/chat";
import { setEquipped } from "./equip";

function onDidEditName(name: string) {
  worldManager.participants.setName(name);
}

function onCloseSpeech() {
  chatOpen.set(false);
  worldManager.participants.setCommunicatingState(null, "speaking", false);
}

export function setAvatarFromParticipant(this: void, participant: Participant) {
  if (!participant) return;
  if (!participant.avatar)
    throw Error(`participant requires avatar: ${participant.participantId}`);

  const isLocal = participant.participantId === playerId;

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
