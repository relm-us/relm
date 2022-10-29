<script lang="ts">
  /**
   * Individual: A combination of a participant's video stream (Oculus), audio stream, and name (NameTag).
   */

  import type { Cut } from "./types";

  import { Audio, Video } from "~/ui/VideoMirror";

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
  export let diameter: number = null;
  export let cuts: Cut[] = null;

  // TODO: Restore proximity audio
  //
  // style="--background-image:url({shineImg}); --oculus-size: {(
  //   volume * 100
  // ).toFixed(3)}%"
</script>

<container style="--background-image:url({shineImg})">
  {#if videoTrack}
    <Oculus {color} {diameter} {cuts} on:click>
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
    /* width: var(--oculus-size, 100%); */
    /* height: var(--oculus-size, 100%); */
    pointer-events: auto;
    height: 100%;
  }
</style>
