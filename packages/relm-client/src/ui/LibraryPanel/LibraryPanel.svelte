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
      id: "list-3",
      name: "Stone",
      category: "library",
      items: [
        {
          id: `stone-1`,
          originalId: `stone-1`,
          name: `Stone 1`,
          orientation: "down",
          size: { w: 2, h: 2, d: 0.1 },
          thumbnail: "65ad631eef317b581c4968c43267ca52-87624.webp",
          asset: "65ad631eef317b581c4968c43267ca52-87624.webp",
        },
        {
          id: `stone-2`,
          originalId: `stone-2`,
          name: `Stone 2`,
          orientation: "down",
          size: { w: 2, h: 2, d: 0.1 },
          thumbnail: "e6804f7e4edb66330e55bb2212a424f8-88518.webp",
          asset: "e6804f7e4edb66330e55bb2212a424f8-88518.webp",
        },
        {
          id: `stone-3`,
          originalId: `stone-3`,
          name: `Stone 3`,
          orientation: "down",
          size: { w: 2, h: 2, d: 0.1 },
          thumbnail: "8030aa0937d770c22e5ac458a7af985b-154776.webp",
          asset: "8030aa0937d770c22e5ac458a7af985b-154776.webp",
        },
        {
          id: `stone-4`,
          originalId: `stone-4`,
          name: `Stone 4`,
          orientation: "down",
          size: { w: 2, h: 2, d: 0.1 },
          thumbnail: "c714b0efc3388209cc9e42923a0ff904-147970.webp",
          asset: "c714b0efc3388209cc9e42923a0ff904-147970.webp",
        },
        {
          id: `stone-5`,
          originalId: `stone-5`,
          name: `Stone 5`,
          orientation: "down",
          size: { w: 2, h: 2, d: 0.1 },
          thumbnail: "db4a63746c3c1bb936c0c1ee686306e5-175918.webp",
          asset: "db4a63746c3c1bb936c0c1ee686306e5-175918.webp",
        },
        {
          id: `stone-6`,
          originalId: `stone-6`,
          name: `Stone 6`,
          orientation: "down",
          size: { w: 2, h: 2, d: 0.1 },
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
  }
  container {
    display: flex;
    height: 100%;
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
