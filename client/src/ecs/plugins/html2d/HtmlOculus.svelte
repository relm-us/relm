<script>
  import { Audio, Video } from "video-mirror";

  export let stream;
  export let mirror;
  export let muted;

  // ignore warning about missing props
  $$props;
</script>

{#if $stream}
  <oculus>
    <Video stream={$stream} {mirror} muted={true} round={true} />
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
    border: 2px solid black;
    border-radius: 100%;
  }
</style>
