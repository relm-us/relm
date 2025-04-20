<script lang="ts">
import { _ } from "svelte-i18n"
import IoIosAdd from "svelte-icons/io/IoIosAdd.svelte"

import { assetUrl } from "~/config/assetUrl"
import Button from "~/ui/lib/Button"
import { librarySearch, libraryPage } from "~/stores/libraryAssets"

import { copyBuffer } from "~/stores/copyBuffer"
import { paste } from "~/events/input/CopyPasteListener/paste"
import { deserializeCopyBuffer } from "~/events/input/CopyPasteListener/common"

import Tag from "./Tag.svelte"

export let asset

const searchTag = (tag: string) => () => {
  $librarySearch = `#${tag}`
  $libraryPage = 0
}

function addAsset() {
  copyBuffer.set(deserializeCopyBuffer(JSON.stringify(asset.ecsProperties)))
  paste()
}
</script>

<r-selected>
  <r-thumb>
    <img src={assetUrl(asset.thumbnail)} alt={asset.name} />
  </r-thumb>

  <r-title>
    {asset.name}
  </r-title>

  <r-details>
    <r-add-button>
      <Button on:click={addAsset} style="border: 1px solid #999;">
        <r-icon><IoIosAdd /></r-icon>
        {$_("AddPanel.add_asset")}
      </Button>
    </r-add-button>

    <r-desc>
      {asset.description}
    </r-desc>

    {#if asset.tags && asset.tags.length > 0}
      <r-tags>
        {#each asset.tags as value}
          {#if value && value !== ""}
            <Tag {value} on:click={searchTag(value)} />
          {/if}
        {/each}
      </r-tags>
    {/if}
  </r-details>
</r-selected>

<style>
  r-selected {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 12px;
  }
  r-title {
    padding: 8px 0 4px 0;
    font-weight: bold;
  }
  r-desc {
    padding: 8px 4px;
    margin: 0 16px;
  }
  r-tags {
    display: block;
    margin: 8px;
  }

  r-add-button {
    display: block;
    margin: 12px 0;

    --direction: row;
    --bg-color: var(--selected-red);
    --bg-hover-color: var(--selected-red-hover);
  }

  r-thumb {
    display: block;
    overflow: hidden;
    width: 150px;
    height: 150px;
    border-radius: 5px;
    background: var(--foreground-white);
  }
  r-thumb img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

  r-details {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  r-icon {
    display: block;
    width: 24px;
    height: 24px;
  }
</style>
