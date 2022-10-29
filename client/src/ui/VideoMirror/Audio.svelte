<script lang="ts">
  import { afterUpdate } from "svelte";

  import { attach } from "./mediaAttachment";

  export let id = "video";
  export let track;
  // iOS needs this so the video doesn't automatically play full screen
  export let muted = false;
  export let volume = 1;

  let audioElement;
  let attachedTrack = null;

  afterUpdate(() => {
    if (track && track !== attachedTrack) {
      if (track.attach) {
        track.attach(audioElement);
      } else {
        attach(audioElement, track);
      }
      attachedTrack = track;
    }
    audioElement.volume = volume;
  });
</script>

<audio
  bind:this={audioElement}
  {id}
  muted={muted ? true : undefined}
  controls={false}
/>
