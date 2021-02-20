<script lang="ts">
  import { mode } from "~/stores/mode";

  export let width: number;
  export let height: number;
  export let url: string;

  let iframe;
  let highlighted = false;

  // We need to do this in Firefox, because we can't just detect a blur event
  // and set focus on the document immediately afterward.
  function forceRestoreFocus(msec = 10) {
    iframe.blur();
    setTimeout(() => {
      if (document.activeElement === iframe) {
        forceRestoreFocus(msec);
      }
    }, msec);
  }

  function onWindowBlur(event: FocusEvent) {
    if (!highlighted) {
      forceRestoreFocus();
    }
  }

  function onFrameMouseout() {
    if ($mode === "play") {
      highlighted = false;
      forceRestoreFocus();
    }
  }

  function onOverlayMousedown() {
    if ($mode === "play") {
      highlighted = true;
      iframe.focus();
    }
  }

  $: if ($mode === "build") highlighted = false;

  // ignore warning about missing props
  $$props;
</script>

<svelte:window on:blur={onWindowBlur} />

<iframe
  bind:this={iframe}
  on:mouseout={onFrameMouseout}
  title="Web Page"
  {width}
  {height}
  src={url}
  frameborder="0"
  allowfullscreen
  allow="camera;microphone"
/>

<overlay
  class:build-mode={$mode === "build"}
  class:highlighted
  on:mousedown={onOverlayMousedown}
/>

<style>
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
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
    box-shadow: inset 0px 0px 0px 6px #000000;

    pointer-events: auto;
  }
  overlay.highlighted {
    box-shadow: inset 0px 0px 0px 6px #ff4400;
    background-color: rgb(0, 0, 0, 0);
    pointer-events: none;
  }
  overlay.build-mode {
    background-color: rgb(240, 240, 240, 0.7);
  }
</style>
