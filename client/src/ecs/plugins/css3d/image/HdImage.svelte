<script lang="ts">
  import { fade } from "svelte/transition";

  import { assetUrl } from "~/config/assetUrl";
  import { Asset } from "~/ecs/plugins/core";
  import { pointerStateDelayed } from "~/events/input/PointerListener/pointerActions";
  import { worldUIMode } from "~/stores/worldUIMode";
  import Fullwindow from "~/ui/lib/Fullwindow.svelte";

  export let asset: Asset;
  export let fit: "COVER" | "CONTAIN";

  let bigscreen = false;

  const activate = () => {
    if (pointerStateDelayed !== "interactive-drag") bigscreen = true;
  };
  const deactivate = () => (bigscreen = false);

  // ignore other props
  $$props;
</script>

{#if bigscreen}
  <Fullwindow on:click={deactivate} on:close={deactivate}>
    <r-frame transition:fade>
      <img
        class:cover={fit === "COVER"}
        class:contain={fit === "CONTAIN"}
        src={assetUrl(asset.url)}
        alt={asset.name}
      />
    </r-frame>
  </Fullwindow>
{/if}

<!-- Always show image in its Css3d container -->
<img
  class:cover={fit === "COVER"}
  class:contain={fit === "CONTAIN"}
  class:cloudy={$worldUIMode === "build"}
  src={assetUrl(asset.url)}
  alt={asset.name}
  on:click={$worldUIMode === "build" ? undefined : activate}
  on:mousedown|preventDefault
/>

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
