<script lang="ts">
  import type { LibraryAsset } from "~/types";

  import { _ } from "svelte-i18n";
  import IoIosArrowBack from "svelte-icons/io/IoIosArrowBack.svelte";

  import { createPrefab } from "~/prefab";

  import SidePanel, { Header } from "~/ui/lib/SidePanel";
  import Search from "~/ui/lib/Search";
  import Button from "~/ui/lib/Button";
  import UploadButton from "~/ui/Build/shared/UploadButton";

  import {
    libraryAssets,
    librarySearch,
    libraryPage,
  } from "~/stores/libraryAssets";

  import SearchResult from "./SearchResult.svelte";
  import HLine from "~/ui/lib/HLine";
  import Paginate from "./Paginate.svelte";
  import SelectedAsset from "./SelectedAsset.svelte";
  import SelectCreatePrefab from "./SelectCreatePrefab.svelte";

  let spinner = false;
  let spinStart = 0;
  let assets: LibraryAsset[] = [];
  let selectedAsset: LibraryAsset;
  let prefabsVisible: boolean = false;

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

<SidePanel on:minimize>
  <Header>{$_("AddPanel.add")}</Header>
  <r-column>
    {#if !prefabsVisible}
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
          <SelectedAsset asset={selectedAsset} />
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
      <r-upload-instructions>
        Upload an image, or .glb model
      </r-upload-instructions>

      <r-line-wrap class="dark">
        <HLine>or</HLine>
      </r-line-wrap>

      <r-prefabs-switch class="dark">
        <a href="#" on:click|preventDefault={() => (prefabsVisible = true)}>
          show prefabs
        </a>
      </r-prefabs-switch>
    {:else}
      <r-prefabs-switch>
        <a href="#" on:click|preventDefault={() => (prefabsVisible = false)}>
          <r-prefab-back style="padding-right:20px">
            <r-icon><IoIosArrowBack /></r-icon>
            back
          </r-prefab-back>
        </a>
      </r-prefabs-switch>

      <SelectCreatePrefab />

      <r-spacer />
    {/if}
  </r-column>
</SidePanel>

<style>
  r-column {
    display: flex;
    flex-direction: column;
    padding: 0 16px;
  }

  r-search-wrap {
    padding-bottom: 8px;
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

  r-line-wrap,
  r-upload-instructions {
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

  r-prefabs-switch {
    text-align: center;
    padding: 12px 0;
  }
  r-prefabs-switch a {
    display: flex;
    justify-content: center;
    color: var(--foreground-white, white);
  }

  .dark,
  .dark a {
    color: var(--foreground-gray, white);
  }

  r-prefab-back {
    display: flex;
    align-items: center;
  }
</style>
