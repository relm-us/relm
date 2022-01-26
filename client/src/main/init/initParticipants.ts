import { get } from "svelte/store";
import { playerId } from "~/identity/playerId";
import { localIdentityData } from "~/stores/identityData";
import { Participant } from "~/types";

export function initParticipants() {
  const participants = new Map<string, Participant>();
  const identityData = get(localIdentityData);
  participants.set(playerId, {
    participantId: playerId,
    isLocal: true,
    editable: true,
    modified: false,
    identityData,
  });
  return participants;
}
