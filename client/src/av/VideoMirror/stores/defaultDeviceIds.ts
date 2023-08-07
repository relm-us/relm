import { derived } from "svelte/store";

import { mediaDevices } from "./mediaDevices";

function getDefault(kind, $mediaDevices) {
  try {
    return $mediaDevices.find((dev) => dev.kind === kind).deviceId;
  } catch (e) {
    return null;
  }
}

export const defaultDeviceIds = derived(
  mediaDevices,
  ($mediaDevices, set) => {
    set({
      videoinput: getDefault("videoinput", $mediaDevices),
      audioinput: getDefault("audioinput", $mediaDevices),
      audiooutput: getDefault("audiooutput", $mediaDevices),
    });
  },
  {
    videoinput: null,
    audioinput: null,
    audiooutput: null,
  }
);
