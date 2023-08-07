<script lang="ts">
  import CircleMask from "./CircleMask.svelte";

  import type { Cut } from "./types";

  export let color: string;
  export let diameter: number = null;
  export let cuts: Cut[] = null;
  export let halo: number = 0;

  $: haloThickness = Math.min(halo, 1) * 5;
</script>

<CircleMask {diameter} {cuts}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <oculus
    style="--oculus-border-color: {color}; --diameter: {diameter}px; --halo-thickness: {haloThickness}px"
    on:click
  >
    <slot />
  </oculus>
</CircleMask>

<style>
  oculus {
    display: flex;
    justify-content: center;
    align-items: center;

    width: var(--diameter, 100px);
    height: var(--diameter, 100px);
    box-shadow: 0 0 5px var(--halo-thickness)
      var(--oculus-border-color, #cccccc);
    background-color: #959595;

    overflow: hidden;
    border: 2px solid var(--oculus-border-color, #cccccc);
    border-radius: 100%;

    /* Safari needs this in order to clip the video as a circle */
    /* transform: translate3d(-2px, 0, 0); */

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  oculus::after {
    content: " ";
    display: block;
    width: 100%;
    height: 100%;
    background-image: var(--background-image);
    position: absolute;
    background-size: 100%;
    opacity: 0.45;
  }
</style>
