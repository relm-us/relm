import type { Entity } from "~/ecs/base";
import { Avatar2 } from "./Avatar2";

export type PlayerStatus = "initial" | "present" | "away";
export type YClientID = number;
export type PlayerID = string;

// Used for "simple" AvatarChooser
export type BinaryGender = "male" | "female";

export type HairType = "bald" | "short" | "mid" | "long";
/**
 * TopType
 *   0: No Top
 *   1: Sports Bra
 *   2: T-Shirt
 *   3: Midsleeve Shirt
 *   4: Longsleeve Shirt
 */
export type TopType = 0 | 1 | 2 | 3 | 4;

/**
 * BottomType
 *   0: Shorts
 *   1: Long Shorts
 *   2: Capris
 *   3: Pants
 */
export type BottomType = 0 | 1 | 2 | 3;

/**
 * ShoeType
 *   0: Barefoot
 *   1: Dance Slippers
 *   2: Runners
 *   3: Hightops
 *   4: Boots
 */
export type ShoeType = 0 | 1 | 2 | 3 | 4;

export type Appearance = {
  genderSlider: number;
  widthSlider: number;

  beard: boolean;
  belt: boolean;
  hair: HairType;
  top: TopType;
  bottom: BottomType;
  shoes: ShoeType;

  skinColor: string;
  hairColor: string;
  topColor: string;
  bottomColor: string;
  beltColor: string;
  shoeColor: string;
};

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
  appearance: Appearance;

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
  clientId?: number;
  message?: string;
  emoji?: string;
};

export type TransformData = [
  playerId: PlayerID,
  x: number,
  y: number,
  z: number,
  theta: number,
  headTheta: number,
  clipIndex: number
];

export type RecvTransformCallback = (transformArray: TransformData[]) => void;

export type AvatarEntities = {
  head: Entity;
  body: Entity;
  emoji: Entity;
};

export type Participant = {
  participantId: string;
  identityData: IdentityData;
  isLocal: boolean;
  modified: boolean;

  lastSeen?: number;

  // Avatar is responsible for all visuals/rendering of this identity
  avatar?: Avatar2;
};
