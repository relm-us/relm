
export type PlayerStatus = "initial" | "present" | "away";
export type YClientID = number;
export type PlayerID = string;

export type IdentityData = {
  // Participant's name (chosen randomly at first, "Guest-xyz")
  name: string;

  // Participant's current yjs clientId (can change from time to time)
  clientId?: YClientID;

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

  // Character colors
  charColors: object;

  // Character morph influences
  charMorphs: object;

  // Most recent chat message (used for chat bubble)
  message?: string;

  // Most recent emoji (used for emote)
  emoji?: string;
};
