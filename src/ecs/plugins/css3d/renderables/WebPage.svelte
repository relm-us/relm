<script lang="ts">
  import { mode } from "~/stores/mode";

  export let width: number;
  export let height: number;
  export let url: string;

  let iframe;
  let frameMouseOver = false;
  let loaded = false;
  let highlighted = false;

  function onWindowBlur() {
    if (frameMouseOver) {
      highlighted = true;
    }
  }

  function onWindowFocus() {
    highlighted = false;
  }

  const onFrameLoad = (event) => {
    loaded = true;
  };

  function onFrameMouseover() {
    frameMouseOver = true;
  }

  function onFrameMouseout() {
    frameMouseOver = false;
  }
</script>

<style>
  iframe {
    display: none;

    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;

    pointer-events: auto;
  }
  iframe.show {
    display: block;
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
  overlay.highlighted {
    box-shadow: inset 0px 0px 0px 6px #ff4400;
    background-color: rgb(0, 0, 0, 0);
    pointer-events: none;
  }
</style>

<svelte:window on:blur={onWindowBlur} on:focus={onWindowFocus} />

<iframe
  bind:this={iframe}
  on:load={onFrameLoad}
  on:mouseover={onFrameMouseover}
  on:mouseout={onFrameMouseout}
  class:show={loaded}
  title="Web Page"
  {width}
  {height}
  src={url}
  frameborder="0"
  allowfullscreen
  allow="camera;microphone" />

{#if $mode === 'build' || highlighted}
  <overlay class:highlighted />
{/if}
