<script lang="ts">
  import type { Entity } from "~/ecs/base";
  import { Asset, Transform } from "~/ecs/plugins/core";

  import { Vector2, Vector3 } from "three";

  import { fade } from "svelte/transition";

  import { worldManager } from "~/world";
  import { assetUrl } from "~/config/assetUrl";
  import { AVATAR_POINTER_TAP_MAX_DISTANCE } from "~/config/constants";

  import { pointerStateDelayed } from "~/events/input/PointerListener/pointerActions";
  import { worldUIMode } from "~/stores/worldUIMode";
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";

  export let asset: Asset;
  export let size: Vector2;
  export let url: string;
  export let visible: boolean;
  export let entity: Entity;
  export let fit: "COVER" | "CONTAIN";

  let fullwindow = false;

  function activateFullwindow() {
    // don't allow activating in build mode
    if ($worldUIMode === "build") return;

    // don't allow activating from accidental drag clicks
    if (pointerStateDelayed === "interactive-drag") return;

    // don't allow activating an image that is too far away from the avatar
    const p1: Vector3 = entity.get(Transform).position;
    const p2: Vector3 = worldManager.participants.local.avatar.position;
    if (p1.distanceTo(p2) > AVATAR_POINTER_TAP_MAX_DISTANCE) return;

    fullwindow = true;
  }

  function deactivateFullwindow() {
    fullwindow = false;
  }

  function getDomain(url: string) {
    return new URL(url).hostname;
  }

  $: if ($worldUIMode === "build") {
    fullwindow = false;
  }

  // ignore other props
  $$props;
</script>

{#if visible}
  {#if fullwindow}
    <Fullwindow
      active={fullwindow}
      on:click={deactivateFullwindow}
      on:close={deactivateFullwindow}
    >
      <r-frame transition:fade>
        <iframe
          title="Web Page"
          width={size.x}
          height={size.y}
          src={url}
          frameborder="0"
          allowfullscreen
          allow="camera;microphone"
          scrolling="yes"
        />
      </r-frame>
    </Fullwindow>
  {/if}

  {#if asset.isEmpty()}
    <iframe
      title="Web Page"
      width={size.x}
      height={size.y}
      src={url}
      frameborder="0"
      allowfullscreen
      allow="camera;microphone"
      scrolling="yes"
    />
  {:else}
    <r-cover-image>
      <img
        class:cover={fit === "COVER"}
        class:contain={fit === "CONTAIN"}
        src={assetUrl(asset.url)}
        alt="Screenshot of Web Page ({getDomain(url)})"
      />
    </r-cover-image>
  {/if}

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <overlay
    class:cloudy={$worldUIMode === "build"}
    on:click={activateFullwindow}
    on:mousedown|preventDefault
  />
{/if}

<style>
  img {
    width: 100%;
    height: 100%;
  }

  img.cover {
    object-fit: cover;
  }

  img.contain {
    object-fit: contain;
  }

  img::before {
    /* For `alt` text */
    line-height: 3em;
  }

  r-frame {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  /* r-frame img {
    width: 90vw;
    height: 90vh;
  } */

  overlay,
  r-cover-image {
    position: absolute;

    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    pointer-events: auto;
  }

  r-cover-image {
    z-index: 2;

    color: black;
    background: white;
  }

  overlay {
    z-index: 3;
  }

  .cloudy {
    background-color: rgba(255, 255, 255, 0.5);
  }

  img {
    width: 100%;
    text-align: center;
    font-size: 28px;
  }
</style>
