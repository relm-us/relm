<script lang="ts">
  import type { LibraryAsset } from "~/types";

  import { config } from "~/config";
  import Tooltip from "~/ui/lib/Tooltip";

  export let result: LibraryAsset;
</script>

<r-result>
  <Tooltip tip={result.name} bottom>
    <img src={`${config.assetUrl}/${result.thumbnail}`} alt={result.name} />
  </Tooltip>
</r-result>

<style>
  r-result {
    display: block;
    width: 80px;
    height: 80px;
    object-fit: cover;

    margin: 4px;

    border: 1px solid var(--foreground-dark-gray);
    border-radius: 5px;
  }
</style>
