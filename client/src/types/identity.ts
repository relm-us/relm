import type { Quaternion, Vector3 } from "three"
import type { Appearance, Equipment, PlayerStatus, SavedIdentityData } from "relm-common"

import type { Entity } from "~/ecs/base"
import type { Avatar } from "~/identity/Avatar"
import type { Seat } from "~/ecs/plugins/player-control"

export type UpdateData = {
  name?: string
  color?: string
  status?: PlayerStatus
  appearance?: Appearance
  equipment?: Equipment
  speaking?: boolean
  emoting?: boolean
  showAudio?: boolean
  showVideo?: boolean
  clientId?: number
  message?: string
  emoji?: string
}

export type IdentityData = SavedIdentityData & {
  // Show the speech bubble?
  speaking: boolean

  // Show current emoji?
  emoting: boolean

  // Participant has mic enabled?
  showAudio: boolean

  // Participant has video enabled?
  showVideo: boolean

  // Last known yjs clientId for this participant
  clientId?: number

  // Most recent chat message (used for chat bubble)
  message?: string

  // Most recent emoji (used for emote)
  emoji?: string
}

export type TransformData = [
  x: number,
  y: number,
  z: number,
  theta: number,
  headTheta: number,
  oculusOffset: number,
  clipIndex: number,
  animLoop: boolean,
  offsetZ: number,
]

export type AvatarEntities = {
  head: Entity
  body: Entity
  emoji: Entity
  equipped?: Entity
}

export type ActionSitChair = {
  state: "sit-chair"
  seat: Seat
  position: Vector3
  rotation: Quaternion
}

export type ActionLeaveChair = {
  state: "leave-chair"
}

export type ActionState =
  | { state: "free" }
  | { state: "waving" }
  | { state: "raise-hand" }
  | { state: "sit-ground" }
  | ActionSitChair
  | ActionLeaveChair

export type Participant = {
  participantId: string
  editable: boolean

  identityData: IdentityData
  modifiedIdentityData: boolean

  actionState: ActionState

  // Avatar is responsible for all visuals/rendering of this identity
  avatar?: Avatar
}

export type ParticipantMap = Map<string, Participant>

export type AnimationOverride = {
  clipName: string
  loop: boolean
}
