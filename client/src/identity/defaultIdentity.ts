import { playerId } from "./playerId";
import { randomColor } from "~/utils/colors";
import { getOrCreateStoredItem as init } from "~/utils/getOrCreateStoredItem";
import { IdentityData } from "./types";

/**
 * Store player identity in localStorage so it persists across relms.
 * Generates a random name and color as default values.
 */
export const defaultIdentity: IdentityData = {
  playerId,
  shared: {
    name: init("playerName", () => `Guest-${playerId.slice(0, 3)}`),
    color: init("playerColor", randomColor),
    status: "present",
  },
  local: {
    hasInitialTransform: false,
    lastSeen: performance.now(),
    isLocal: true,
  },
};
