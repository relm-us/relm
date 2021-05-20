import { writable, Writable } from "svelte-local-storage-store";
import { get } from "svelte/store";

import { playerId } from "./playerId";
import { randomColor } from "~/utils/colors";
import { IdentityData } from "./types";
import { getCharacterFacemaps } from "./colors";
import { randomMorphInfluences } from "./morphs";

/**
 * Generates a random name and color as default values.
 */
export const defaultIdentityData: IdentityData = {
  name: `Guest-${playerId.slice(0, 3)}`,
  color: randomColor(),
  status: "initial", // 'initial' means don't show avatar yet
  speaking: false,
  emoting: false,
  showAudio: false,
  showVideo: false,
  charColors: getCharacterFacemaps(),
  charMorphs: randomMorphInfluences(),
};

export const localIdentityData: Writable<IdentityData> = writable(
  "identity",
  defaultIdentityData
);

export function getLocalIdentityData(): IdentityData {
  return get(localIdentityData);
}
