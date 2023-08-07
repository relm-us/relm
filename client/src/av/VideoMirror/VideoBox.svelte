<script lang="ts">
  import { spring } from "svelte/motion";

  import Video from "~/av/components/Video";

  export let track = null;
  export let blocked = false;
  export let opaque = false;
  export let enabled = true;

  let videoPositionSpring = spring(0, {
    stiffness: 0.5,
    damping: 0.3,
  });

  export function shake() {
    videoPositionSpring.set(10);
    setTimeout(() => videoPositionSpring.set(0), 100);
  }
</script>

<container class:opaque={!opaque}>
  {#if enabled}
    <Video {track} visible={true} mirror={true} class="rounded-video" />
  {/if}
  <div
    class:opaque
    class:blocked
    class="video-stack overlay"
    style="transform: translate({$videoPositionSpring}px, 0)"
  >
    <slot />
  </div>
</container>

<style>
  container {
    display: flex;
    justify-content: center;

    overflow: hidden;
    border-radius: 10px;
    width: 375px;
    height: 225px;
  }

  :global(.rounded-video) {
    border-radius: 10px;
  }

  .video-stack {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;

    border-radius: 10px;
    width: 375px;
    height: 225px;
  }
  .overlay {
    position: absolute;
  }
  .opaque {
    background-color: #555;
  }
  .blocked {
    background-color: #f55;
  }
</style>
