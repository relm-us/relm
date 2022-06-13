import { get } from "svelte/store";
import { participantId } from "~/identity/participantId";
import { localIdentityData } from "~/stores/identityData";
import { Participant } from "~/types";

export function initParticipants() {
  const participants = new Map<string, Participant>();
  const identityData = get(localIdentityData);
  participants.set(participantId, {
    participantId,
    editable: true,
    modified: false,
    identityData,
  });
  return participants;
}
