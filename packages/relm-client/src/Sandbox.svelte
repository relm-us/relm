<script>
  import SortableList from "./ui/LibraryPanel/SortableList.svelte";
  import Dropzone from "./ui/LibraryPanel/Dropzone.svelte";
  import { uuidv4 } from "~/utils/uuid";

  let currentListId = "list-1";
  let currentList;

  const lists = [
    {
      id: "list-1",
      name: "My Favorites",
      category: "fav",
      items: [1, 2].map((i) => ({
        id: `item-${i}`,
        originalId: `item-${i}`,
        name: `Fav ${i}`,
      })),
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
      console.log("lists", sourceList, destList);

      if (sourceList.category === destList.category) {
        // MOVE

        // copy to dest list
        destList.items.push(detail.item);
        // delete from source list
        setTimeout(() => {
          detail.list.items.splice(idx, 1);
          currentList.items = detail.list.items;
        }, 0);
      } else {
        // COPY

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
</style>

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
      on:drop={handleTrash} />
  </div>
  <div class="items">
    <SortableList bind:items={currentList.items} list={currentList} />
  </div>
</container>
