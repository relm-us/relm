import { Readable, derived } from "svelte/store";

import { localStream } from "./localStream";

export const localAudioTrack: Readable<MediaStreamTrack> = derived(
  [localStream],
  ([$stream], set) => {
    if ($stream) {
      set($stream.getAudioTracks()[0] || null);
    } else {
      set(null);
    }
  },
  null
);
