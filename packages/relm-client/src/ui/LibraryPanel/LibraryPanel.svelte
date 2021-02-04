<script lang="ts">
  import Dropzone from "./Dropzone.svelte";
  import SortableList from "./SortableList.svelte";
  import LeftPanel, { Header } from "~/ui/LeftPanel";
  import type { Collection } from "./types";
  import { uuidv4 } from "~/utils/uuid";
  import UploadButton from "~/ui/UploadButton";

  import IoIosTrash from "svelte-icons/io/IoIosTrash.svelte";

  // import { favorites } from "~/stores/collections";

  let currentListId = "list-1";
  let currentList;

  const lists: Array<Collection> = [
    {
      id: "list-1",
      name: "My Favorites",
      category: "favorite",
      items: [],
    },
    {
      id: "list-2",
      name: "Trees",
      category: "library",
      items: [
        {
          id: `tree-1`,
          originalId: `tree-1`,
          name: `Tree 1`,
          orientation: "up",
          size: { w: 6, h: 6, d: 0.1 },
          base: 2.3,
          thumbnail: "1219d2f700b7daa0335507a06f70e701-211714.webp",
          asset: "1219d2f700b7daa0335507a06f70e701-211714.webp",
        },
        {
          id: `tree-2`,
          originalId: `tree-2`,
          name: `Tree 2`,
          orientation: "up",
          size: { w: 3.4, h: 3.4, d: 0.1 },
          base: 1.8,
          thumbnail: "790c498fed1d6aae04b7e560f7aaf822-49468.webp",
          asset: "790c498fed1d6aae04b7e560f7aaf822-49468.webp",
        },
        {
          id: `tree-3`,
          originalId: `tree-3`,
          name: `Tree 3`,
          orientation: "up",
          size: { w: 7, h: 7, d: 0.1 },
          base: 3.4,
          thumbnail: "5775c0901dd939dacda9f2d40502d2de-363150.webp",
          asset: "5775c0901dd939dacda9f2d40502d2de-363150.webp",
        },
        {
          id: `tree-4`,
          originalId: `tree-4`,
          name: `Tree 4`,
          orientation: "up",
          size: { w: 9, h: 9, d: 0.1 },
          base: 3.6,
          thumbnail: "93064d65baa31484c404c38f681d01a4-200378.webp",
          asset: "93064d65baa31484c404c38f681d01a4-200378.webp",
        },
        {
          id: `tree-5`,
          originalId: `tree-5`,
          name: `Tree 5`,
          orientation: "up",
          size: { w: 7, h: 7, d: 0.1 },
          base: 3.5,
          thumbnail: "9f548af74fb29a27086f6926ba69aa6d-119028.webp",
          asset: "9f548af74fb29a27086f6926ba69aa6d-119028.webp",
        },
        {
          id: `tree-6`,
          originalId: `tree-6`,
          name: `Tree 6`,
          orientation: "up",
          size: { w: 18, h: 18, d: 0.1 },
          base: 3.6,
          thumbnail: "05159a8f60d21324382c7779497500b3-205526.webp",
          asset: "05159a8f60d21324382c7779497500b3-205526.webp",
        },
        {
          id: `tree-7`,
          originalId: `tree-7`,
          name: `Tree 7`,
          orientation: "up",
          size: { w: 5, h: 5, d: 0.1 },
          base: 2.4,
          thumbnail: "aa9ec5f02162b7b9ae124d071383aa6f-225858.webp",
          asset: "aa9ec5f02162b7b9ae124d071383aa6f-225858.webp",
        },
        {
          id: `tree-8`,
          originalId: `tree-8`,
          name: `Tree 8`,
          orientation: "up",
          size: { w: 5, h: 5, d: 0.1 },
          base: 2.2,
          thumbnail: "006ceace39ed4b812657fb12e99672e6-72306.webp",
          asset: "006ceace39ed4b812657fb12e99672e6-72306.webp",
        },
      ],
    },
    {
      id: "list-3",
      name: "Signs",
      category: "library",
      items: [
        {
          id: `sign-1`,
          originalId: `sign-1`,
          name: `Sign 1`,
          orientation: "up",
          size: { w: 2, h: 2, d: 0.1 },
          base: 1,
          thumbnail: "fc8baf4aaa0a007268e451c1b1a9ed45-48082.webp",
          asset: "fc8baf4aaa0a007268e451c1b1a9ed45-48082.webp",
        },
        {
          id: `sign-2`,
          originalId: `sign-2`,
          name: `Sign 2`,
          orientation: "up",
          size: { w: 2, h: 2, d: 0.1 },
          base: 1,
          thumbnail: "0db09eea412e2b8ed1a6ccf06a67ae32-45652.webp",
          asset: "0db09eea412e2b8ed1a6ccf06a67ae32-45652.webp",
        },
        {
          id: `sign-3`,
          originalId: `sign-3`,
          name: `Sign 3`,
          orientation: "up",
          size: { w: 2, h: 2, d: 0.1 },
          base: 1,
          thumbnail: "fb83262f1cc5327d7169b6a211e49326-53994.webp",
          asset: "fb83262f1cc5327d7169b6a211e49326-53994.webp",
        },
        {
          id: `sign-4`,
          originalId: `sign-4`,
          name: `Sign 4`,
          orientation: "up",
          size: { w: 2, h: 2, d: 0.1 },
          base: 1,
          thumbnail: "4ab1f8b0397d2325e3f157bd5cf461c1-51242.webp",
          asset: "4ab1f8b0397d2325e3f157bd5cf461c1-51242.webp",
        },
        {
          id: `sign-5`,
          originalId: `sign-5`,
          name: `Sign 5`,
          orientation: "up",
          size: { w: 2, h: 2, d: 0.1 },
          base: 1,
          thumbnail: "8af533c3f7a850381025c01b96e0c435-46640.webp",
          asset: "8af533c3f7a850381025c01b96e0c435-46640.webp",
        },
        {
          id: `sign-6`,
          originalId: `sign-6`,
          name: `Sign 6`,
          orientation: "up",
          size: { w: 2, h: 2, d: 0.1 },
          base: 1,
          thumbnail: "d2ba86b454d6dea6291c5f51d976bd16-46070.webp",
          asset: "d2ba86b454d6dea6291c5f51d976bd16-46070.webp",
        },
        {
          id: `sign-7`,
          originalId: `sign-7`,
          name: `Sign 7`,
          orientation: "up",
          size: { w: 2, h: 2, d: 0.1 },
          base: 1,
          thumbnail: "14b182988283faa828f2aa06fcb80bdd-51434.webp",
          asset: "14b182988283faa828f2aa06fcb80bdd-51434.webp",
        },
        {
          id: `sign-8`,
          originalId: `sign-8`,
          name: `Sign 8`,
          orientation: "up",
          size: { w: 2, h: 2, d: 0.1 },
          base: 1,
          thumbnail: "fc7b895c9d4882cd56326ce68f191763-42342.webp",
          asset: "fc7b895c9d4882cd56326ce68f191763-42342.webp",
        },
        {
          id: `sign-9`,
          originalId: `sign-9`,
          name: `Sign 9`,
          orientation: "up",
          size: { w: 2, h: 2, d: 0.1 },
          base: 1,
          thumbnail: "6b6acbd5b153a45d9fd8f0901fa4f2ef-37876.webp",
          asset: "6b6acbd5b153a45d9fd8f0901fa4f2ef-37876.webp",
        },
        {
          id: `sign-10`,
          originalId: `sign-10`,
          name: `Sign 10`,
          orientation: "up",
          size: { w: 2, h: 2, d: 0.1 },
          base: 1,
          thumbnail: "0b25300218f8a3dfb30a4cfec2fd7f26-40992.webp",
          asset: "0b25300218f8a3dfb30a4cfec2fd7f26-40992.webp",
        },
        {
          id: `sign-11`,
          originalId: `sign-11`,
          name: `Sign 11`,
          orientation: "up",
          size: { w: 2, h: 2, d: 0.1 },
          base: 1,
          thumbnail: "1d435a416318c4d396d3926e656e5163-35276.webp",
          asset: "1d435a416318c4d396d3926e656e5163-35276.webp",
        },
        {
          id: `sign-12`,
          originalId: `sign-12`,
          name: `Sign 12`,
          orientation: "up",
          size: { w: 2, h: 2, d: 0.1 },
          base: 1,
          thumbnail: "f59312f059f8fb80e922a32810050e92-49934.webp",
          asset: "f59312f059f8fb80e922a32810050e92-49934.webp",
        },
        {
          id: `sign-13`,
          originalId: `sign-13`,
          name: `Sign 13`,
          orientation: "up",
          size: { w: 2, h: 2, d: 0.1 },
          base: 1,
          thumbnail: "b409aa03b4d18202dc8cdcdd257615b1-43970.webp",
          asset: "b409aa03b4d18202dc8cdcdd257615b1-43970.webp",
        },
        {
          id: `sign-14`,
          originalId: `sign-14`,
          name: `Sign 14`,
          orientation: "up",
          size: { w: 2, h: 2, d: 0.1 },
          base: 1,
          thumbnail: "8a42ce3b63ecd64ce274e72cb4769fa4-35684.webp",
          asset: "8a42ce3b63ecd64ce274e72cb4769fa4-35684.webp",
        },
      ],
    },
    {
      id: "list-4",
      name: "Stone",
      category: "library",
      items: [
        {
          id: `stone-1`,
          originalId: `stone-1`,
          name: `Stone 1`,
          orientation: "down",
          size: { w: 2, h: 2, d: 0.1 },
          base: 0.01,
          thumbnail: "65ad631eef317b581c4968c43267ca52-87624.webp",
          asset: "65ad631eef317b581c4968c43267ca52-87624.webp",
        },
        {
          id: `stone-2`,
          originalId: `stone-2`,
          name: `Stone 2`,
          orientation: "down",
          size: { w: 2, h: 2, d: 0.1 },
          base: 0.01,
          thumbnail: "e6804f7e4edb66330e55bb2212a424f8-88518.webp",
          asset: "e6804f7e4edb66330e55bb2212a424f8-88518.webp",
        },
        {
          id: `stone-3`,
          originalId: `stone-3`,
          name: `Stone 3`,
          orientation: "down",
          size: { w: 2, h: 2, d: 0.1 },
          base: 0.01,
          thumbnail: "8030aa0937d770c22e5ac458a7af985b-154776.webp",
          asset: "8030aa0937d770c22e5ac458a7af985b-154776.webp",
        },
        {
          id: `stone-4`,
          originalId: `stone-4`,
          name: `Stone 4`,
          orientation: "down",
          size: { w: 2, h: 2, d: 0.1 },
          base: 0.01,
          thumbnail: "c714b0efc3388209cc9e42923a0ff904-147970.webp",
          asset: "c714b0efc3388209cc9e42923a0ff904-147970.webp",
        },
        {
          id: `stone-5`,
          originalId: `stone-5`,
          name: `Stone 5`,
          orientation: "down",
          size: { w: 2, h: 2, d: 0.1 },
          base: 0.01,
          thumbnail: "db4a63746c3c1bb936c0c1ee686306e5-175918.webp",
          asset: "db4a63746c3c1bb936c0c1ee686306e5-175918.webp",
        },
        {
          id: `stone-6`,
          originalId: `stone-6`,
          name: `Stone 6`,
          orientation: "down",
          size: { w: 2, h: 2, d: 0.1 },
          base: 0.01,
          thumbnail: "d786c985cedd9d196fab2994d080e258-53796.webp",
          asset: "d786c985cedd9d196fab2994d080e258-53796.webp",
        },
      ],
    },
  ];

  $: currentList = lists.find((list) => list.id === currentListId);

  const handleDrop = (destList) => ({ detail }) => {
    // console.log(`received`, detail);

    const sourceList = lists.find((l) => l.id === detail.list.id);

    const idx = detail.list.items.findIndex((i) => i.id === detail.item.id);
    if (idx >= 0) {
      // console.log("lists", sourceList, destList);

      if (/* MOVE */ sourceList.category === destList.category) {
        // A move is first a copy to dest list
        destList.items.push(detail.item);
        // ... then a delete from source list
        setTimeout(() => {
          detail.list.items.splice(idx, 1);
          currentList.items = detail.list.items;
        }, 0);
      } /* COPY */ else {
        const alreadyExists = destList.items.find(
          (item) => item.originalId === detail.item.originalId
        );
        if (!alreadyExists) {
          // copy to dest list with new ID
          destList.items.push({
            ...detail.item,
            // copied items need unique IDs so that svelte-dnd-action
            // doesn't visually re-arrange order when changing categories
            id: uuidv4(),
          });
        }
      }
    }
  };

  const handleTrash = ({ detail }) => {
    const listIdx = lists.findIndex((l) => l.id === detail.list.id);
    const idx = detail.list.items.findIndex((i) => i.id === detail.item.id);
    if (listIdx >= 0 && idx >= 0) {
      setTimeout(() => {
        detail.list.items.splice(idx, 1);
        currentList.items = detail.list.items;
      }, 0);
    }
  };

  const switchCategory = (list) => (event) => {
    currentListId = list.id;
  };

  function onUploaded({ detail }) {
    for (const result of detail.results) {
      const newId = uuidv4();
      const newItem = {
        id: newId,
        originalId: newId,
        name: result.name,
        thumbnail: result.types.webp,
        asset: result.types.webp,
      };
      // console.log("newItem", newItem);
      currentList.items = [...currentList.items, newItem];
    }
  }
</script>

<LeftPanel on:minimize>
  <Header>Collections</Header>
  <container>
    <div class="categories">
      {#each lists as list (list.id)}
        <Dropzone
          {list}
          selected={list.id === currentListId}
          on:drop={handleDrop(list)}
          on:click={switchCategory(list)}
        />
      {/each}
      <Dropzone
        list={{ name: "Trash", id: "trash", category: "trash" }}
        on:drop={handleTrash}
      >
        <icon>
          <IoIosTrash />
        </icon>
      </Dropzone>
    </div>
    <div class="items">
      <div class="list-header">{currentList.name}</div>
      <div class="upload">
        <UploadButton on:uploaded={onUploaded}>
          <lbl>Upload</lbl>
        </UploadButton>
      </div>
      <SortableList bind:items={currentList.items} list={currentList} />
    </div>
  </container>
</LeftPanel>

<style>
  .categories {
    display: flex;
    flex-direction: column;
  }
  .items {
    display: flex;
    flex-direction: column;
    max-width: 220px;

    overflow-y: scroll;
    /* hide scroll bars */
    -ms-overflow-style: none; /* Internet Explorer 10+ */
    scrollbar-width: none; /* Firefox */
  }
  .items::-webkit-scrollbar {
    /* hide scroll bars */
    display: none; /* Safari and Chrome */
    width: 0;
    height: 0;
  }
  container {
    display: flex;
    height: 100%;
    overflow: hidden;
  }
  icon {
    display: block;
    width: 48px;
    height: 48px;
    margin: auto auto;
  }
  .list-header {
    margin: 8px 4px;
    padding: 8px 0px;
    font-weight: bold;
    font-size: 24px;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.25);
    color: var(--foreground-white);
  }
  .upload {
    --direction: row;
    --margin: 4px;
    margin-bottom: 4px;
  }
  .upload lbl {
    margin-left: 8px;
  }
</style>
