<script lang="ts">
  import { spring } from "svelte/motion";
  import { onDestroy } from "svelte";

  import { audioActivity } from "~/av/utils/audioActivity";

  export let stream: MediaStream;

  let activity;
  let audioLevel = 0;

  $: if (stream && stream.getAudioTracks().length) {
    if (activity) activity.destroy();
    activity = audioActivity(stream, {}, (value) => (audioLevel = value));
  }

  // Animation springs
  let audioLevelSpring = spring(0, {
    stiffness: 0.4,
    damping: 0.6,
  });

  $: {
    let x = audioLevel;
    let y = Math.log10(x + 1 / 10) + 1;
    audioLevelSpring.set(y);
  }

  onDestroy(() => {
    if (activity) activity.destroy();
  });
</script>

<indicator
  style="--audio-level:{((1 - $audioLevelSpring) * 100).toFixed(2) + '%'}"
  class={$$props.class}
>
  <slot />
</indicator>

<style>
  indicator {
    display: block;
    position: relative;
  }
  indicator:before {
    content: " ";
    display: block;
    position: absolute;

    width: 100%;
    height: 100%;
    max-height: 100%;
    bottom: 0;
    left: 0;
    background-color: rgba(70, 180, 74, 0.7);
    /* border: 1px solid rgba(70, 180, 74, 0.7); */
    border-radius: 8px;
    clip-path: inset(var(--audio-level) -0.5px -0.5px -0.5px);
  }
</style>
