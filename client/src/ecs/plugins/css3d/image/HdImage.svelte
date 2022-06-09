<script lang="ts">
  import { assetUrl } from "~/config/assetUrl";
  import { Asset } from "~/ecs/plugins/core";

  export let asset: Asset;
  export let fit: "COVER" | "CONTAIN";

  // ignore other props
  $$props;
</script>

<img
  class:cover={fit === "COVER"}
  class:contain={fit === "CONTAIN"}
  src={assetUrl(asset.url)}
  alt={asset.name}
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
</style>
