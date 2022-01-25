import { get, Writable } from "svelte/store";

import { playerId } from "./playerId";
import { randomColor } from "~/utils/colors";
import { storedWritable } from "~/utils/storedWritable";
import { IdentityData } from "~/types";

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
  appearance: undefined, // undefined allows to pick up default value later
};

export const localIdentityData: Writable<IdentityData> = storedWritable(
  "identity",
  defaultIdentityData
);

export function getLocalIdentityData(): IdentityData {
  return get(localIdentityData);
}
