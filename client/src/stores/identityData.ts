import { Readable } from "svelte/store";

import { randomColor } from "~/utils/colors";
import { storedWritable } from "~/utils/storedWritable";
import { IdentityData } from "~/types";

export const localIdentityData: Readable<IdentityData> = storedWritable(
  "identity",
  /**
   * Generates a random name and color as default values.
   */
  {
    name: "",
    color: randomColor(),
    status: "initial", // 'initial' means don't show avatar yet
    speaking: false,
    emoting: false,
    showAudio: false,
    showVideo: false,
  }
);
