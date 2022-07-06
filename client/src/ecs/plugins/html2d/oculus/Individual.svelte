<script lang="ts">
  /**
   * Individual: A combination of a participant's video stream (Oculus), audio stream, and name (NameTag).
  */
 
  import { Audio, Video } from "video-mirror";

  import NameTag from "./NameTag.svelte";
  import Oculus from "./Oculus.svelte";
  import shineImg from "./shine.svg";

  export let color: string = "white";
  export let name: string = "";
  export let mirror: boolean = false;
  export let editable: boolean = false;
  export let volume: number = 1.0;
  export let audioTrack = null;
  export let videoTrack = null;
</script>

<container
  style="--background-image:url({shineImg}); --oculus-size: {(
    volume * 100
  ).toFixed(3)}%"
>
  {#if videoTrack}
    <Oculus {color} on:click>
      <Video track={videoTrack} {mirror} />
    </Oculus>
  {/if}
  <NameTag {name} {color} {editable} on:change />

  {#if audioTrack}
    <Audio track={audioTrack} {volume} />
  {/if}
</container>

<style>
  container {
    display: block;
    position: relative;
    width: var(--oculus-size, 100%);
    height: var(--oculus-size, 100%);
    pointer-events: auto;
  }
</style>
