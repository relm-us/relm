<script lang="ts">
  import type { LibraryAsset } from "~/types";

  import { slide } from "svelte/transition";

  import { config } from "~/config";
  import { createPrefab } from "~/prefab";

  import LeftPanel, { Header } from "~/ui/lib/LeftPanel";
  import Search from "~/ui/lib/Search";
  import Button from "~/ui/lib/Button";
  import UploadButton from "~/ui/Build/shared/UploadButton";
  import Pane from "~/ui/lib/LeftPanel/Pane.svelte";

  import { copyBuffer } from "~/stores/copyBuffer";
  import {
    libraryAssets,
    librarySearch,
    libraryPage,
  } from "~/stores/libraryAssets";

  import { paste } from "~/events/input/CopyPasteListener/paste";
  import { deserializeCopyBuffer } from "~/events/input/CopyPasteListener/common";

  import SearchResult from "./SearchResult.svelte";
  import SelectCreatePrefab from "./SelectCreatePrefab.svelte";
  import Tag from "./Tag.svelte";

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

  function onCloseSelectedAsset() {
    selectedAsset = null;
  }

  const searchTag = (tag: string) => () => {
    $librarySearch = `#${tag}`;
    $libraryPage = 0;
  };

  const onUpload = ({ detail }) => {
    console.log("onUpload", detail);
    for (const result of detail.results) {
      if (result.types.webp) {
        createPrefab("Image", { url: result.types.webp });
      } else if (result.types.gltf) {
        createPrefab("Thing", { url: result.types.gltf });
      }
    }
  };

  function prevPage() {
    if ($libraryPage > 0) $libraryPage = $libraryPage - 1;
  }

  function nextPage() {
    $libraryPage = $libraryPage + 1;
  }
</script>

<LeftPanel on:minimize>
  <Header>Add</Header>
  <r-column>
    <r-search-wrap>
      <Search
        bind:value={$librarySearch}
        on:keydown={() => ($libraryPage = 0)}
        placeholder="Search Assets..."
      />
    </r-search-wrap>
    {#if selectedAsset}
      <Pane
        title={selectedAsset.name}
        showClose={true}
        on:close={onCloseSelectedAsset}
      >
        <r-selected transition:slide>
          <r-thumb>
            <img
              src="{config.assetUrl}/{selectedAsset.thumbnail}"
              alt={selectedAsset.name}
            />
          </r-thumb>

          <r-details>
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
            <r-add-button>
              <Button
                on:click={addAsset(selectedAsset)}
                style="border: 1px solid #999;"
              >
                Add {selectedAsset.name}
              </Button>
            </r-add-button>
          </r-details>
        </r-selected>
      </Pane>
    {:else}
      <r-tag-sampler>
        e.g.
        <Tag value="nature" on:click={searchTag("nature")} />
        <Tag value="furniture" on:click={searchTag("furniture")} />
        <Tag value="path" on:click={searchTag("path")} />
      </r-tag-sampler>
    {/if}
    <r-spacer />
    <r-pagination>
      {#if $libraryPage > 0}
        <Button on:click={prevPage}>Prev</Button>
      {:else}
        <div />
      {/if}
      <r-page>p. {$libraryPage + 1}</r-page>
      {#if assets.length > 0}
        <Button on:click={nextPage}>Next</Button>
      {:else}
        <div />
      {/if}
    </r-pagination>
    {#if spinner && window.performance.now() - spinStart > 1000}
      <r-results>
        <r-spinner>Loading...</r-spinner>
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
        <r-spinner>Empty Page</r-spinner>
      </r-results>
    {/if}
    <r-spacer />
    <UploadButton on:uploaded={onUpload} />
    <SelectCreatePrefab />
  </r-column>
</LeftPanel>

<style>
  r-column {
    display: flex;
    flex-direction: column;
  }

  r-search-wrap {
    padding: 16px 16px 8px 16px;
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
  r-tag-sampler {
    display: block;
    margin: 0px 12px;
  }
  r-thumb {
    display: block;
    width: 150px;
    height: 150px;
    border: 2px solid var(--foreground-dark-gray);
    border-radius: 5px;
  }
  r-thumb img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
  r-details {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  r-spinner {
    display: block;
    width: 100%;
    text-align: center;
  }

  r-results {
    display: flex;
    margin: 8px 4px 0 10px;
    flex-wrap: wrap;
  }
  r-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 38.5px;
  }
  r-pagination > div {
    min-width: 62px;
    margin: 0 16px;
  }
  r-page {
    display: block;
    color: #aaa;
  }

  r-spacer {
    display: block;
    margin-top: 12px;
  }
</style>
