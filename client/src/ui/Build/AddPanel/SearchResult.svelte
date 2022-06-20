<script lang="ts">
  import type { LibraryAsset } from "~/types";

  import { assetUrl } from "~/config/assetUrl";
  import Tooltip from "~/ui/lib/Tooltip";

  export let result: LibraryAsset;
</script>

<Tooltip tip={result.name} bottom>
  <r-result on:click>
    <img src={assetUrl(result.thumbnail)} alt={result.name} />
    {@html `<!-- assetId: ${result.assetId} -->`}
  </r-result>
</Tooltip>

<style>
  r-result {
    display: block;
    width: 80px;
    height: 80px;

    margin: 4px;

    border: 1px solid var(--foreground-dark-gray);
    border-radius: 5px;
  }

  r-result img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
</style>
