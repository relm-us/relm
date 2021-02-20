export type SharedIdentityFields = {
  name?: string;
  color?: string;
  clientId?: number;
  status?: PlayerStatus;
};

export type LocalIdentityFields = {
  // Whether or not we've received a position for the other player yet
  hasInitialTransform?: boolean;

  // Milliseconds since last seen (useful for visualizing disconnected players)
  lastSeen?: number;

  /**
   * Whether this avatar is
   *  a) local (controlled by the player), or
   *  b) remote (controlled by the network)
   */
  isLocal?: boolean;
};

export type IdentityData = {
  playerId: string;
  shared: SharedIdentityFields;
  local: LocalIdentityFields;
};

export type PlayerStatus = "present" | "away";
export type YClientID = number;
export type PlayerID = string;
