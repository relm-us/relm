<script lang="ts">
  import type { LibraryAsset } from "~/types";

  import { config } from "~/config";
  import Tooltip from "~/ui/lib/Tooltip";

  export let result: LibraryAsset;
</script>

<r-result on:click>
  <Tooltip tip={result.name} bottom>
    <img src={`${config.assetUrl}/${result.thumbnail}`} alt={result.name} />
  </Tooltip>
  {@html `<!-- assetId: ${result.assetId} -->`}
</r-result>

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
