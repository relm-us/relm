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
      <r-frame transition:fade>
        <img class="contain" src={assetUrl(asset.url)} alt={asset.name} />
      </r-frame>
    </Fullwindow>
  {/if}

  <!-- Always show image in its Css3d container -->
  <img
    class:cover={fit === "COVER"}
    class:contain={fit === "CONTAIN"}
    src={assetUrl(asset.url)}
    alt={asset.name}
    on:click={$worldUIMode === "build" ? undefined : activate}
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

  r-frame {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  r-frame img {
    width: 90vw;
    height: 90vh;
  }
</style>
