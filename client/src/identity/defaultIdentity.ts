import { playerId } from "./playerId";
import { randomColor } from "~/utils/colors";
import { IdentityData } from "./types";

/**
 * Generates a random name and color as default values.
 */
export const defaultIdentity: IdentityData = {
  playerId,
  shared: {
    name: `Guest-${playerId.slice(0, 3)}`,
    color: randomColor(),
    status: "present",
  },
  local: {
    hasInitialTransform: false,
    lastSeen: performance.now(),
    isLocal: true,
  },
};
