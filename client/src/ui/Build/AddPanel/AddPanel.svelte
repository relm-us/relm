<script lang="ts">
  import type { LibraryAsset } from "~/types";

  import { _ } from "svelte-i18n";
  import IoIosArrowBack from "svelte-icons/io/IoIosArrowBack.svelte";

  import { assetUrl } from "~/config/assetUrl";
  import { createPrefab } from "~/prefab";

  import BuildPanel, { Header } from "~/ui/lib/BuildPanel";
  import Search from "~/ui/lib/Search";
  import Button from "~/ui/lib/Button";
  import UploadButton from "~/ui/Build/shared/UploadButton";

  import { copyBuffer } from "~/stores/copyBuffer";
  import {
    libraryAssets,
    librarySearch,
    libraryPage,
  } from "~/stores/libraryAssets";

  import { paste } from "~/events/input/CopyPasteListener/paste";
  import { deserializeCopyBuffer } from "~/events/input/CopyPasteListener/common";

  import SearchResult from "./SearchResult.svelte";
  import Tag from "./Tag.svelte";
  import HLine from "~/ui/lib/HLine";
  import Paginate from "./Paginate.svelte";

  let spinner = false;
  let spinStart = 0;
  let assets: LibraryAsset[] = [];
  let selectedAsset: LibraryAsset;

  $: switch ($libraryAssets.type) {
    case "init":
      break;
    case "fetching":
      spinner = true;
      spinStart = performance.now();
      break;
    case "success":
      spinner = false;
      assets = $libraryAssets.assets;
      break;
    case "error":
      spinner = false;
      assets = [];
      break;
    default:
      console.warn("Unknown libraryAsset type:", $libraryAssets);
  }

  const addAsset = (asset: LibraryAsset) => () => {
    copyBuffer.set(deserializeCopyBuffer(JSON.stringify(asset.ecsProperties)));
    paste();
  };

  const searchTag = (tag: string) => () => {
    $librarySearch = `#${tag}`;
    $libraryPage = 0;
  };

  const onUpload = ({ detail }) => {
    for (const result of detail.results) {
      if (result.types.webp) {
        const maxSide = 3;
        let width, height;
        if (result.aspect < 1) {
          width = maxSide;
          height = maxSide / result.aspect;
        } else {
          height = maxSide;
          width = maxSide * result.aspect;
        }

        createPrefab("Image", { url: result.types.webp, w: width, h: height });
      } else if (result.types.gltf) {
        createPrefab("Thing", { url: result.types.gltf });
      }
    }
  };
</script>

<BuildPanel on:minimize>
  <Header>Add Object</Header>
  <r-column>
    <r-search-pane>
      <r-search-back>
        {#if selectedAsset}
          <r-selected-back>
            <Button on:click={() => (selectedAsset = null)}>
              <r-icon><IoIosArrowBack /></r-icon>
            </Button>
          </r-selected-back>
        {/if}

        <r-search-wrap>
          <Search
            bind:value={$librarySearch}
            on:keydown={() => ($libraryPage = 0)}
            placeholder={$_("AddPanel.search_assets")}
          />
        </r-search-wrap>
      </r-search-back>

      <r-spacer />

      {#if selectedAsset}
        <r-selected>
          <r-selected-thumb>
            <img
              src={assetUrl(selectedAsset.thumbnail)}
              alt={selectedAsset.name}
            />
          </r-selected-thumb>

          <r-selected-details>
            <r-add-button>
              <Button
                on:click={addAsset(selectedAsset)}
                style="border: 1px solid #999;"
              >
                {$_("AddPanel.add_asset", {
                  values: { name: selectedAsset.name },
                })}
              </Button>
            </r-add-button>

            <r-desc>
              {selectedAsset.description}
            </r-desc>

            {#if selectedAsset.tags && selectedAsset.tags.length > 0}
              <r-tags>
                {#each selectedAsset.tags as value}
                  <Tag {value} on:click={searchTag(value)} />
                {/each}
              </r-tags>
            {/if}
          </r-selected-details>
        </r-selected>
      {:else}
        {#if spinner && window.performance.now() - spinStart > 1000}
          <r-results>
            <r-spinner>{$_("AddPanel.loading")}</r-spinner>
          </r-results>
        {:else if assets.length > 0}
          <r-results>
            {#each assets as asset}
              <SearchResult
                result={asset}
                on:click={() => (selectedAsset = asset)}
              />
            {/each}
          </r-results>
        {:else}
          <r-results>
            <r-spinner>{$_("AddPanel.empty_results")}</r-spinner>
          </r-results>
        {/if}

        <r-spacer />

        <Paginate assetCount={assets.length} />
      {/if}
    </r-search-pane>

    <r-line-wrap>
      <HLine>or</HLine>
    </r-line-wrap>
    <UploadButton on:uploaded={onUpload} />
    <r-line-wrap> Upload an image, or .glb model </r-line-wrap>
    <!-- <SelectCreatePrefab /> -->
  </r-column>
</BuildPanel>

<style>
  r-column {
    display: flex;
    flex-direction: column;
    padding: 0 16px;
  }

  r-search-wrap {
    padding-bottom: 8px;
  }

  r-selected {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 12px;
  }
  r-desc {
    padding: 8px 4px;
    margin: 0 16px;
  }
  r-add-button {
    display: block;
    margin: 12px 0;
  }
  r-tags {
    display: block;
    margin: 8px;
  }

  r-selected-thumb {
    display: block;
    overflow: hidden;
    width: 150px;
    height: 150px;
    border-radius: 5px;
    background: var(--foreground-white);
  }
  r-selected-thumb img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
  r-selected-details {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  r-spinner {
    display: block;

    grid-column-start: 1;
    grid-column-end: 4;
    grid-row-start: 1;
    grid-row-end: 4;
    height: 212px;

    text-align: center;
    color: var(--foreground-white);
  }

  r-search-pane {
    background: rgba(120, 120, 120, 0.5);
    border-radius: 6px;
    padding: 8px;
  }

  r-results {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }

  r-results :global(.tooltip-slot) {
    /* Fixes slight padding issue when tooltip is inside grid CSS */
    display: flex;
    aspect-ratio: 1;
  }

  r-icon {
    display: block;
    width: 24px;
    height: 24px;
  }

  r-spacer {
    display: block;
    margin-top: 12px;
  }

  r-line-wrap {
    margin: 20px 0 20px 0;
  }

  r-selected-back {
    --margin: 0;
    --padv: 3px;
    --padh: 3px;
    --bg-color: transparent;
    --bg-hover-color: rgba(0, 0, 0, 0.1);
  }
  r-search-back {
    display: flex;
  }
</style>
