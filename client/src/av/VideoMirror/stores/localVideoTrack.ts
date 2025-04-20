import { type Readable, derived } from "svelte/store"

import { localStream } from "./localStream"

export const localVideoTrack: Readable<MediaStreamTrack> = derived(
  [localStream],
  ([$stream], set) => {
    if ($stream) {
      set($stream.getVideoTracks()[0] || null)
    } else {
      set(null)
    }
  },
  null,
)
