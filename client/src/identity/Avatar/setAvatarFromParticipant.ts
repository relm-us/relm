import { Participant } from "~/identity/types";

import { setAppearance } from "./appearance";
import { setEmoji } from "./emoji";
import { setLabel } from "./label";
import { setOculus } from "./oculus";
import { setSpeech } from "./speech";

export function setAvatarFromParticipant(this: void, participant: Participant) {
  if (!participant) return;
  if (!participant.avatar)
    throw Error(`participant requires avatar: ${participant.participantId}`);

  const entities = participant.avatar.entities;
  const data = participant.identityData;
  setAppearance(entities, data.appearance);
  setEmoji(entities, data.emoji, data.emoting);
  setLabel(entities, data.name, data.color, participant.isLocal);
  setOculus(
    entities,
    participant.participantId,
    data.showAudio,
    data.showVideo
  );
  setSpeech(entities, data.message, data.speaking, participant.isLocal);

  return true;
}
