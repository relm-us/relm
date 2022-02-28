<script lang="ts">
  import type { LibraryAsset } from "~/types";

  import debounce from "lodash/debounce";
  import { slide } from "svelte/transition";

  import { config } from "~/config";

  import { worldManager } from "~/world";
  import { createPrefab } from "~/prefab";

  import LeftPanel, { Header } from "~/ui/lib/LeftPanel";
  import Search from "~/ui/lib/Search";
  import Button from "~/ui/lib/Button";
  import UploadButton from "~/ui/Build/shared/UploadButton";
  import Pane from "~/ui/lib/LeftPanel/Pane.svelte";

  import { copyBuffer } from "~/stores/copyBuffer";
  import { paste } from "~/events/input/CopyPasteListener/paste";
  import { deserializeCopyBuffer } from "~/events/input/CopyPasteListener/common";

  import SearchResult from "./SearchResult.svelte";
  import SelectCreatePrefab from "./SelectCreatePrefab.svelte";
  import Tag from "./Tag.svelte";

  let search;
  let lastSearch;
  let lastPage = 0;
  let spinner = false;
  let selectedAsset: LibraryAsset;
  let assets: LibraryAsset[] = [];
  let page = 0;

  const isTag = (booleanValue: boolean) => (term) => {
    return term.startsWith("#") === booleanValue;
  };

  const query = async (search, page) => {
    if (search === lastSearch && page === lastPage) return;
    lastSearch = search;
    lastPage = page;

    spinner = true;
    const terms = search ? search.trim().split(/\s+/) : [];
    const tags = terms.filter(isTag(true)).map((tag) => tag.slice(1));
    const keywords = terms.filter(isTag(false));
    assets = await worldManager.api.queryAssets({ keywords, tags, page });
    spinner = false;
  };

  type queryFn = (search: string, page: number) => void;
  const debouncedQuery: queryFn = debounce(query, 500, {
    leading: true,
  });

  const addAsset = (asset: LibraryAsset) => () => {
    copyBuffer.set(deserializeCopyBuffer(JSON.stringify(asset.ecsProperties)));
    paste();
  };

  function onCloseSelectedAsset() {
    selectedAsset = null;
  }

  const searchTag = (tag: string) => () => {
    search = `#${tag}`;
  };

  function isEmpty(str: string) {
    if (!str) return true;
    else return str.match(/^\s*$/);
  }

  $: debouncedQuery(isEmpty(search) ? null : search, page);

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
</script>

<LeftPanel on:minimize>
  <Header>Add</Header>
  <r-column>
    <r-search-wrap>
      <Search bind:value={search} placeholder="Search Assets..." />
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
      {#if page > 0}
        <Button on:click={() => (page = page - 1)}>Prev</Button>
      {:else}
        <div />
      {/if}
      <r-page>p. {page + 1}</r-page>
      {#if assets.length > 0}
        <Button on:click={() => (page = page + 1)}>Next</Button>
      {:else}
        <div />
      {/if}
    </r-pagination>
    {#if spinner}
      <r-results transition:slide>
        <r-spinner>Loading...</r-spinner>
      </r-results>
    {:else}
      <r-results transition:slide>
        {#each assets as asset}
          <SearchResult
            result={asset}
            on:click={() => (selectedAsset = asset)}
          />
        {/each}
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
