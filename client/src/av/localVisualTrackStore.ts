import { writable, derived, Readable, Writable } from "svelte/store";
import { LocalVideoTrack } from "twilio-video";
import { localVideoTrack as localVideoTrackStore } from "~/ui/VideoMirror";

export const localShareTrackStore: Writable<LocalVideoTrack> = writable(null);

export const localVisualTrackStore: Readable<
  LocalVideoTrack | MediaStreamTrack
> = derived(
  [localShareTrackStore, localVideoTrackStore],
  ([$localShareTrack, $localVideoTrack], set) => {
    if ($localShareTrack) {
      set($localShareTrack);
    } else {
      if ($localShareTrack) $localShareTrack.stop();
      set($localVideoTrack);
    }
  }
);
