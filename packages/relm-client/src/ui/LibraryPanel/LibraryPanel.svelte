<script lang="ts">
  import Dropzone from "./Dropzone.svelte";
  import SortableList from "./SortableList.svelte";
  import LeftPanel, { Header } from "~/ui/LeftPanel";
  import type { Collection } from "./types";
  import { uuidv4 } from "~/utils/uuid";
  import UploadButton from "~/ui/UploadButton";

  import IoIosTrash from "svelte-icons/io/IoIosTrash.svelte";

  import { favorites } from "~/stores/collections";

  let currentListId = "list-1";
  let currentList;

  const lists: Array<Collection> = [
    {
      id: "list-1",
      name: "My Favorites",
      category: "favorite",
      items: [
        {
          id: `item-1`,
          originalId: `item-1`,
          name: `Fav 1`,
          thumbnail: "2985fd45eaa5b0a15788a27f8ad55493-199684.webp",
          asset: "2985fd45eaa5b0a15788a27f8ad55493-199684.webp",
        },
        {
          id: `item-2`,
          originalId: `item-2`,
          name: `Fav 2`,
          thumbnail: "9809768b0111d0e82a05e5ecd82cdc8e-286840.webp",
          asset: "9809768b0111d0e82a05e5ecd82cdc8e-286840.webp",
        },
      ],
    },
    {
      id: "list-2",
      name: "This Relm",
      category: "relm",
      items: [3].map((i) => ({
        id: `item-${i}`,
        originalId: `item-${i}`,
        name: `Relm ${i}`,
      })),
    },
    {
      id: "list-3",
      name: "Buildings",
      category: "library",
      items: [4, 5].map((i) => ({
        id: `item-${i}`,
        originalId: `item-${i}`,
        name: `Building ${i}`,
      })),
    },
    {
      id: "list-4",
      name: "Foliage",
      category: "library",
      items: [6, 7].map((i) => ({
        id: `item-${i}`,
        originalId: `item-${i}`,
        name: `Foliage ${i}`,
      })),
    },
  ];

  $: currentList = lists.find((list) => list.id === currentListId);

  const handleDrop = (destList) => ({ detail }) => {
    console.log(`received`, detail);

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

<LeftPanel on:minimize>
  <Header>Collections</Header>
  <container>
    <div class="categories">
      {#each lists as list (list.id)}
        <Dropzone
          {list}
          selected={list.id === currentListId}
          on:drop={handleDrop(list)}
          on:click={switchCategory(list)} />
      {/each}
      <Dropzone
        list={{ name: 'Trash', id: 'trash', category: 'trash' }}
        on:drop={handleTrash}>
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
