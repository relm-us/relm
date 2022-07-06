import { Writable } from "svelte/store";

import { randomColor } from "~/utils/colors";
import { storedWritable } from "~/utils/storedWritable";
import { IdentityData } from "~/types";

export const getRandomInitializedIdentityData = (): IdentityData => {
  return {
    name: "",
    color: randomColor(),
    status: "initial", // 'initial' means don't show avatar yet
    speaking: false,
    emoting: false,
    showAudio: false,
    showVideo: false,
  };
}

export const localIdentityData: Writable<IdentityData> = storedWritable(
  "identity",
  /**
   * Generates a random name and color as default values.
   */
  getRandomInitializedIdentityData()
);