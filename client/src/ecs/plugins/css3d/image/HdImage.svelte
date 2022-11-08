<script lang="ts">
  import type { Entity } from "~/ecs/base";

  import { fade } from "svelte/transition";
  import { Vector3 } from "three";

  import { worldManager } from "~/world";
  import { AVATAR_POINTER_TAP_MAX_DISTANCE } from "~/config/constants";
  import { assetUrl } from "~/config/assetUrl";

  import { Asset, Transform } from "~/ecs/plugins/core";

  import { pointerStateDelayed } from "~/events/input/PointerListener/pointerActions";
  import { worldUIMode } from "~/stores/worldUIMode";
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";

  export let asset: Asset;
  export let fit: "COVER" | "CONTAIN";
  export let visible: boolean;
  export let entity: Entity;

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

  $: if ($worldUIMode === "build") {
    fullwindow = false;
  }

  // ignore other props
  $$props;
</script>

{#if visible}
  {#if fullwindow}
    <Fullwindow on:click={deactivateFullwindow} on:close={deactivateFullwindow}>
      <r-fullwindow-image transition:fade>
        <img class="contain" src={assetUrl(asset.url)} alt={asset.name} />
      </r-fullwindow-image>
    </Fullwindow>
  {/if}

  <!-- Always show image in its Css3d container -->
  <r-image>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <img
      class:cover={fit === "COVER"}
      class:contain={fit === "CONTAIN"}
      src={assetUrl(asset.url)}
      alt={asset.name === "" ? "HD Image" : asset.name}
      on:click={activateFullwindow}
      on:mousedown|preventDefault
    />
  </r-image>
{/if}

<style>
  img {
    width: 100%;
    height: 100%;

    /* For `alt` text */
    text-align: center;
  }

  img::before {
    /* For `alt` text */
    line-height: 3em;
    background: white;
    color: black;
    font-size: 28px;
  }

  img.cover {
    object-fit: cover;
  }

  img.contain {
    object-fit: contain;
  }

  r-fullwindow-image {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  r-fullwindow-image img {
    width: 90vw;
    height: 90vh;
  }

  r-image {
    position: absolute;

    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    pointer-events: auto;

    color: black;
    background: white;
  }
</style>
