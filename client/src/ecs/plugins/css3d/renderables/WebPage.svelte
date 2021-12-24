<script lang="ts">
  import { Entity } from "~/ecs/base";
  import { worldUIMode } from "~/stores/worldUIMode";
  import { worldManager } from "~/world";
  import { config } from "~/config";

  export let width: number;
  export let height: number;
  export let url: string;
  export let alwaysOn: boolean;
  export let entity: Entity;

  let iframe;
  let active = false;
  let highlighted = false;

  // We need to do this in Firefox, because we can't just detect a blur event
  // and set focus on the document immediately afterward.
  function forceRestoreFocus(msec = 10) {
    iframe?.blur();
    setTimeout(() => {
      if (document.activeElement === iframe) {
        forceRestoreFocus(msec);
      }
    }, msec);
  }

  function onWindowBlur(event: FocusEvent) {
    if (active) {
      setTimeout(() => {
        if (document.activeElement === iframe) {
          highlighted = true;
        }
      }, 10);
    } else {
      forceRestoreFocus();
    }
  }

  function onWindowFocus(event: FocusEvent) {
    highlighted = false;
    worldManager.camera.followParticipant();
  }

  function onFrameMouseout() {
    if ($worldUIMode === "play" && !alwaysOn) {
      active = false;
      highlighted = false;
      forceRestoreFocus();
      worldManager.camera.followParticipant();
    }
  }

  function onOverlayMousedown() {
    if ($worldUIMode === "play") {
      if (worldManager.camera.state.type === "following") {
        worldManager.camera.focus(entity, () => {
          active = true;
          highlighted = true;
          iframe?.focus();
        });
      }
    }
  }

  function screenshot(url, width = 800, height = 600) {
    return (
      config.serverUrl +
      `/screenshot/${width}x${height}/${encodeURIComponent(url)}`
    );
  }

  $: if ($worldUIMode === "build") {
    active = false;
    highlighted = false;
  }
  $: if (alwaysOn) active = true;

  // ignore warning about missing props
  $$props;
</script>

<svelte:window on:blur={onWindowBlur} on:focus={onWindowFocus} />

<iframe
  bind:this={iframe}
  on:mouseout={onFrameMouseout}
  class:active
  title="Web Page"
  {width}
  {height}
  src={url}
  frameborder="0"
  allowfullscreen
  allow="camera;microphone"
  scrolling="yes"
/>
{#if !active}
  <img src={screenshot(url, width, height)} alt="screenshot" />
{/if}

<overlay
  class:build-mode={$worldUIMode === "build"}
  class:active
  class:highlighted
  on:mousedown={onOverlayMousedown}
/>

<style>
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;

    display: none;
  }
  iframe.active {
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
    box-shadow: inset 0px 0px 0px 6px #000000;

    pointer-events: auto;
  }
  overlay.highlighted {
    box-shadow: inset 0px 0px 0px 6px #ff4400;
    background-color: rgb(0, 0, 0, 0);
  }
  overlay.active {
    pointer-events: none;
  }
  overlay.build-mode {
    background-color: rgb(240, 240, 240, 0.7);
  }

  img {
    width: 100%;
  }
</style>
