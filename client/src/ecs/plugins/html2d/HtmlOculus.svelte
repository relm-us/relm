<script>
  import { Audio, Video } from "video-mirror";

  export let stream;
  export let mirror;
  export let muted;
  export let color;

  // ignore warning about missing props
  $$props;
</script>

{#if $stream}
  <oculus style="--color:{color}">
    <Video stream={$stream} {mirror} muted={true} />
    <Audio stream={$stream} {muted} />
  </oculus>
{/if}

<style lang="scss">
  oculus {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    border: 2px solid var(--color, #ccc);
    border-radius: 100%;
    box-shadow: 0 0 5px var(--color, #ccc);
    overflow: hidden;
  }
</style>
