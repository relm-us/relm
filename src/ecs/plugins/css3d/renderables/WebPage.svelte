<script lang="ts">
  import { mode } from "~/stores/mode";

  export let width: number;
  export let height: number;
  export let url: string;

  let iframe;
</script>

<style>
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;

    pointer-events: auto;
  }
  overlay {
    position: absolute;
    z-index: 2;

    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    color: black;
    background-color: rgb(240, 240, 240, 0.7);
    box-shadow: inset 0px 0px 0px 6px #000000;
  }
</style>

<iframe
  bind:this={iframe}
  title="Web Page"
  {width}
  {height}
  src={url}
  frameborder="0"
  allowfullscreen />

{#if $mode === 'build'}
  <overlay />
{/if}
