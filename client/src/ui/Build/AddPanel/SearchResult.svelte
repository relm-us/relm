<script lang="ts">
import type { LibraryAsset } from "~/types"

import { assetUrl } from "~/config/assetUrl"
import Tooltip from "~/ui/lib/Tooltip"

export let result: LibraryAsset
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
    overflow: hidden;
    aspect-ratio: 1;

    margin: 4px;
    border-radius: 5px;
    background-color: var(--foreground-white);
  }

  r-result img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
</style>
