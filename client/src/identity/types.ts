export type SharedIdentityFields = {
  // Participant's name (chosen randomly at first, "Guest-xyz")
  name?: string;

  // Participant's preferred color (chosen randomly at first)
  color?: string;

  // Yjs clientID
  clientId?: number;

  // Has participant notified that they will be "away"?
  status?: PlayerStatus;

  // Show the speech bubble?
  speaking?: boolean;

  // Show current emoji?
  emoting?: boolean;

  // Participant has video enabled?
  showVideo?: boolean;

  // Participant has mic enabled?
  showAudio?: boolean;

  // Character colors
  charColors?: object;

  // Character morph influences
  charMorphs?: object;
};

export type LocalIdentityFields = {
  // Whether or not we've received a position for the other player yet
  hasInitialTransform?: boolean;

  // Milliseconds since last seen (useful for visualizing disconnected players)
  lastSeen?: number;

  // Most recent chat message (used for chat bubble)
  message?: string;

  // Most recent emoji (used for emote)
  emoji?: string;

  /**
   * Whether this avatar is
   *  a) local (controlled by the player), or
   *  b) remote (controlled by the network)
   */
  isLocal?: boolean;

  // Distance in world units from the participant
  distance?: number;
};

export type IdentityData = {
  playerId: string;
  shared: SharedIdentityFields;
  local: LocalIdentityFields;
};

export type PlayerStatus = "initial" | "present" | "away";
export type YClientID = number;
export type PlayerID = string;
