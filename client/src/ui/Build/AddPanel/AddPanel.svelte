<script lang="ts">
  import type { LibraryAsset } from "~/types";

  import LeftPanel, { Header } from "~/ui/lib/LeftPanel";
  import Search from "svelte-search";
  import debounce from "lodash/debounce";
  import { worldManager } from "~/world";
  import SearchResult from "./SearchResult.svelte";
  import { Transform } from "~/ecs/plugins/core";
  import UploadButton from "~/ui/Build/shared/UploadButton";
  import { createPrefab } from "~/prefab";
  import { copyBuffer } from "~/stores/copyBuffer";
  import { paste } from "~/events/input/CopyPasteListener/paste";
  import { deserializeCopyBuffer } from "~/events/input/CopyPasteListener/common";

  let search;
  let results: LibraryAsset[] = [];

  const isTag = (booleanValue: boolean) => (term) => {
    return term.startsWith("#") === booleanValue;
  };

  const query: (search?: string) => void = debounce(async (search) => {
    const terms = search ? search.trim().split(/\s+/) : [];
    const tags = terms.filter(isTag(true)).map((tag) => tag.slice(1));
    const keywords = terms.filter(isTag(false));
    results = await worldManager.api.queryAssets({ keywords, tags });
  }, 500);

  const addAsset = (result) => () => {
    copyBuffer.set(deserializeCopyBuffer(JSON.stringify(result.ecsProperties)));
    paste();
  };

  function empty(str: string) {
    if (!str) return true;
    else return str.match(/^\s*$/);
  }

  $: query(empty(search) ? null : search);

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
  <Header>Library</Header>
  <r-column>
    <r-search>
      <Search hideLabel bind:value={search} placeholder="Search Assets..." />
    </r-search>
    <r-results>
      {#each results as result}
        <SearchResult {result} on:click={addAsset(result)} />
      {/each}
    </r-results>
    <UploadButton on:uploaded={onUpload} />
  </r-column>
</LeftPanel>

<style>
  :global([data-svelte-search] input) {
    width: 100%;
    font-size: 1rem;
    padding: 0.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 0.25rem;
  }
  r-column {
    display: flex;
    flex-direction: column;
  }
  r-search {
    display: block;
    padding: 0 0.5rem;
  }
  r-results {
    display: flex;
    margin: 8px auto;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
