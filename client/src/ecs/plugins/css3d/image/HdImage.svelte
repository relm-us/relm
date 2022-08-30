<script lang="ts">
  import type { Asset } from "~/ecs/plugins/core";

  import { fade } from "svelte/transition";

  import { assetUrl } from "~/config/assetUrl";
  import { pointerStateDelayed } from "~/events/input/PointerListener/pointerActions";
  import { worldUIMode } from "~/stores/worldUIMode";
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";

  export let asset: Asset;
  export let fit: "COVER" | "CONTAIN";
  export let visible: boolean;

  let bigscreen = false;

  const activate = () => {
    if (pointerStateDelayed !== "interactive-drag") bigscreen = true;
  };
  const deactivate = () => (bigscreen = false);

  $: if ($worldUIMode === "build") {
    bigscreen = false;
  }

  // ignore other props
  $$props;
</script>

{#if visible}
  {#if bigscreen}
    <Fullwindow on:click={deactivate} on:close={deactivate}>
      <r-fullwindow-image transition:fade>
        <img class="contain" src={assetUrl(asset.url)} alt={asset.name} />
      </r-fullwindow-image>
    </Fullwindow>
  {/if}

  <!-- Always show image in its Css3d container -->
  <r-image>
    <img
      class:cover={fit === "COVER"}
      class:contain={fit === "CONTAIN"}
      src={assetUrl(asset.url)}
      alt={asset.name === "" ? "HD Image" : asset.name}
      on:click={$worldUIMode === "build" ? undefined : activate}
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
