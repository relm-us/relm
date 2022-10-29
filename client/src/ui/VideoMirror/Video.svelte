<script lang="ts">
  import { afterUpdate, onMount } from "svelte";

  import { attach } from "./mediaAttachment";

  export let track;
  export let mirror = false;
  export let contain = false;
  export let fullscreen = false;
  export let muted = true;
  export let round = false;
  export let visible = false;

  let videoElement;
  let initiallyVisible = visible;
  let eventuallyVisible = visible;
  let attachedTrack = null;

  afterUpdate(() => {
    if (track && attachedTrack !== track) {
      if (track.attach) {
        track.attach(videoElement);
      } else {
        attach(videoElement, track);
      }
      eventuallyVisible = true;
      attachedTrack = track;
    }
  });
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<video
  bind:this={videoElement}
  class={$$props.class}
  class:mirror
  class:contain
  class:fullscreen
  class:round
  class:initiallyVisible={visible}
  class:eventuallyVisible={initiallyVisible ? false : eventuallyVisible}
  muted={muted ? true : undefined}
  disablePictureInPicture=""
/>

<style>
  video {
    object-fit: cover;
    width: 100%;
    height: 100%;
    opacity: 0;
  }
  video.contain {
    object-fit: contain;
  }

  .initiallyVisible {
    opacity: 1 !important;
  }

  @keyframes eventuallyVisible {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .eventuallyVisible {
    animation-name: eventuallyVisible;
    animation-duration: 1s;
    animation-delay: 0.5s;
    animation-timing-function: ease-in;
    animation-fill-mode: forwards;
  }
  .mirror {
    transform: scaleX(-1);
  }
  .fullscreen {
    width: 100%;
    height: 100%;
  }
  .round {
    border-radius: 100%;
  }
</style>
