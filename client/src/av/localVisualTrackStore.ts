import { writable, derived, Readable, Writable } from "svelte/store";
import { LocalVideoTrack } from "twilio-video";
import { localVideoTrack as localVideoTrackStore } from "./VideoMirror";

export const localShareTrackStore: Writable<LocalVideoTrack> = writable(null);

export const localVisualTrackStore: Readable<
  LocalVideoTrack | MediaStreamTrack
> = derived(
  [localShareTrackStore, localVideoTrackStore],
  ([$localShareTrack, $localVideoTrack], set) => {
    if ($localShareTrack) {
      // TODO: make a type-safe way to pass the priority to publishLocalTracks
      ($localShareTrack as any).priority = "high";
      set($localShareTrack);
    } else {
      if ($localShareTrack) $localShareTrack.stop();
      set($localVideoTrack);
    }
  }
);
