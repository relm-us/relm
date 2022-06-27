import type { Appearance, Equipment } from "relm-common";

import type { Entity } from "~/ecs/base";
import type { Avatar } from "~/identity/Avatar";

export type PlayerStatus = "initial" | "present" | "away";

export type IdentityData = {
  // Participant's name (chosen randomly at first, "Guest-xyz")
  name: string;

  // Participant's preferred color (chosen randomly at first)
  color: string;

  // Has participant notified that they will be "away"?
  status: PlayerStatus;

  // Show the speech bubble?
  speaking: boolean;

  // Show current emoji?
  emoting: boolean;

  // Participant has mic enabled?
  showAudio: boolean;

  // Participant has video enabled?
  showVideo: boolean;

  // Avatar appearance, based on Avatar Builder settings
  appearance?: Appearance;

  // If the participant is holding / wearing / has something equipped
  equipment?: Equipment;

  // Last known yjs clientId for this participant
  clientId?: number;

  // Most recent chat message (used for chat bubble)
  message?: string;

  // Most recent emoji (used for emote)
  emoji?: string;
};

export type UpdateData = {
  name?: string;
  color?: string;
  status?: PlayerStatus;
  speaking?: boolean;
  emoting?: boolean;
  showAudio?: boolean;
  showVideo?: boolean;
  appearance?: Appearance;
  equipment?: Equipment;
  clientId?: number;
  message?: string;
  emoji?: string;
};

export type TransformData = [
  x: number,
  y: number,
  z: number,
  theta: number,
  headTheta: number,
  oculusOffset: number
];

export type AnimationData = {
  clipIndex: number;
  animLoop: boolean;
};

export type AvatarEntities = {
  head: Entity;
  body: Entity;
  emoji: Entity;
  equipped?: Entity;
};

export type Participant = {
  participantId: string;
  identityData: IdentityData;
  editable: boolean;
  modified: boolean;

  lastSeen?: number;

  // Avatar is responsible for all visuals/rendering of this identity
  avatar?: Avatar;
};
