<script lang="ts">
import { afterUpdate } from "svelte"

import { attach } from "~/av/utils/mediaAttachment"

export let track: MediaStreamTrack

// iOS needs this so the video doesn't automatically play full screen
export const muted = false
export const volume = 1
export const id = "video"

let audioElement: HTMLAudioElement
let attachedTrack = null

afterUpdate(() => {
  if (track && track !== attachedTrack) {
    if ("attach" in track && typeof track.attach === "function") {
      track.attach(audioElement)
    } else {
      attach(audioElement, track)
    }
    attachedTrack = track
  }
  audioElement.volume = volume
})
</script>

<audio
  bind:this={audioElement}
  {id}
  muted={muted ? true : undefined}
  controls={false}
/>
