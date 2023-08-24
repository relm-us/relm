import { derived } from "svelte/store";

import { audioActivity } from "~/av/utils/audioActivity";
import { localStream } from "./localStream";

export const localAudioLevel = derived(
  [localStream],
  ([$stream], set) => {
    let activity;
    if ($stream && $stream.getAudioTracks().length) {
      activity = audioActivity($stream, set);
    }

    return () => {
      if (activity) activity();
    };
  },
  0
);
