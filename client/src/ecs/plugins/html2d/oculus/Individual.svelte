<script lang="ts">
  /**
   * Individual: A combination of a participant's video stream (Oculus), audio stream, and name (NameTag).
   */

  import type { Cut } from "./types";
  import type { Track } from "~/av/base/types";

  import Audio from "~/av/components/Audio";
  import Video from "~/av/components/Video";

  import NameTag from "./NameTag.svelte";
  import Oculus from "./Oculus.svelte";
  import shineImg from "./shine.svg";

  export let color: string = "white";
  export let name: string = "";
  export let mirror: boolean = false;
  export let editable: boolean = false;
  export let volume: number = 1.0;
  export let audioTrack: Track = null;
  export let videoTrack: Track = null;
  export let diameter: number = null;
  export let cuts: Cut[] = null;
</script>

<container style="--background-image:url({shineImg})">
  {#if videoTrack}
    <Oculus {color} {diameter} {cuts} on:click>
      {#if videoTrack}
        <Video track={videoTrack} {mirror} />
      {/if}
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
