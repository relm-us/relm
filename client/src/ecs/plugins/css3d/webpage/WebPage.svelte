<script lang="ts">
  import { Vector2 } from "three";

  import { worldUIMode } from "~/stores/worldUIMode";
  import { config } from "~/config";

  export let size: Vector2;
  export let url: string;
  export let alwaysOn: boolean;
  export let visible: boolean;

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
  }

  function onFrameMouseout() {
    if ($worldUIMode === "play" && !alwaysOn) {
      active = false;
      highlighted = false;
      forceRestoreFocus();
    }
  }

  function onOverlayMousedown() {
    if ($worldUIMode === "play") {
      active = true;
      highlighted = true;
      iframe?.focus();
    }
  }

  function screenshot(url: string, size: Vector2) {
    return (
      config.serverUrl +
      `/screenshot/${size.x}x${size.y}/${encodeURIComponent(url)}`
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

{#if visible}
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <iframe
    bind:this={iframe}
    on:mouseout={onFrameMouseout}
    class:active
    title="Web Page"
    width={size.x}
    height={size.y}
    src={url}
    frameborder="0"
    allowfullscreen
    allow="camera;microphone"
    scrolling="yes"
  />
  {#if !active}
    <img src={screenshot(url, size)} alt="screenshot" />
  {/if}

  <overlay
    class:build-mode={$worldUIMode === "build"}
    class:active
    class:highlighted
    on:mousedown={onOverlayMousedown}
  />
{/if}

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
