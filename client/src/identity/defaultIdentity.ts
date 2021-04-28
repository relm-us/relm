import { playerId } from "./playerId";
import { randomColor } from "~/utils/colors";
import { IdentityData } from "./types";
import { getCharacterFacemaps } from "./colors";
import { randomMorphInfluences } from "./morphs";

/**
 * Generates a random name and color as default values.
 */
export const defaultIdentity: IdentityData = {
  playerId,
  shared: {
    name: `Guest-${playerId.slice(0, 3)}`,
    color: randomColor(),
    status: "initial", // 'initial' means don't show avatar yet
    charColors: getCharacterFacemaps(),
    charMorphs: randomMorphInfluences(),
  },
  local: {
    hasInitialTransform: false,
    lastSeen: performance.now(),
    isLocal: true,
  },
};
