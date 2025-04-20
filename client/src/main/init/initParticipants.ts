import { get } from "svelte/store"
import { participantId } from "~/identity/participantId"
import { localIdentityData } from "~/stores/identityData"
import type { Participant } from "~/types"

export function initParticipants() {
  const participants = new Map<string, Participant>()
  const identityData = get(localIdentityData)
  participants.set(participantId, {
    participantId,
    editable: true,

    identityData,
    modifiedIdentityData: false,

    actionState: { state: "free" },
  })
  return participants
}
