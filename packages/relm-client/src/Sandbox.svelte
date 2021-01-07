<script>
  import { uuidv4 } from "~/utils/uuid";

  import SortableList from "./SortableList.svelte";
  import Sortable from "sortablejs/modular/sortable.core.esm.js";

  let cloneItem;

  const lists = {
    0: [1, 2].map((i) => ({
      id: i,
      text: `Fav ${i}`,
    })),

    1: [3, 4, 5].map((i) => ({
      id: i,
      text: `Relm ${i}`,
    })),
  };
  window.lists = lists;

  const sortableOptions = {
    group: {
      name: "items",
      pull: "clone",
      // pull: (to, from) => {
      //   return "clone";
      // },
      // put: (to, from) => {
      //   return true;
      // },
    },
    // removeCloneOnHide: true,
    animation: 150,
    easing: "cubic-bezier(1, 0, 0, 1)",

    onClone: (event) => {
      // event.item.dataset.id = uuidv4();
      // event.clone.dataset.id = uuidv4();
      Sortable.eventCanceled = true;
      return;
      const oldId = event.clone.dataset.id;
      console.log("onClone", oldId);
      cloneItem = Object.assign({}, getItemById(oldId));
      const newId = uuidv4();
      // Sortable.clone.dataset.id = newId;
      cloneItem.id = newId;
      event.item.dataset.id = newId;
      // console.log("onClone", event, Sortable.clone);

      // const sortable = Sortable.get(event.to);
      // lists[sortable.listId].push(cloneItem);
    },

    onEnd: (event) => {
      if (event.pullMode === "clone") {
        // console.log("event", event);
        // event.cancel();
        // console.log("item", event.item);
        // console.log("clone", event.clone);
        // const newId = uuidv4();
        // event.clone.dataset.id = newId;
        // const sortable = Sortable.get(event.to);
        // const sortable = Sortable.get(event.to);
        // lists[sortable.listId].push(cloneItem);
        // console.log("onEnd", sortable.listId, event);
      }
    },
  };

  const getItemById = (id) => {
    // if (!id) throw new Error("getItemById ID is", id);
    const allItems = Object.values(lists).flat();
    // console.log("getItemById", id, lists, allItems);
    return allItems.find((item) => item.id == id);
  };

  const listChanged = (listId) => ({ detail }) => {
    // console.log("item order changed!", listId, detail);
    // lists[listId] = [];
    // setTimeout(() => {
    // console.log("detail", listId, detail);
    // lists[listId] = detail;
    // }, 0);
  };

  // $: console.log("lists", lists);
</script>

<style>
  /* you need to use :global so that Svelte does not optimize away the in its view "unused" classes
     see https://github.com/sveltejs/svelte/issues/2870 */
  :global(.item) {
    list-style: none;
    width: 100px;
    height: 100px;

    cursor: pointer;
    border: 1px solid black;
    /* max-width: 200px; */
    /* padding: 8px; */
    margin: 4px;
  }

  .item-border {
    margin: 8px;
  }
  :global(.list) {
    display: flex;
    flex-wrap: wrap;
    width: 220px;
    min-height: 100px;
  }

  :global(.crazy) {
    color: red;
  }
  .container {
    display: flex;
    flex-direction: column;
    max-width: 220px;
  }
</style>

<div class="container">
  {#each Object.keys(lists) as listId}
    <div style="border-bottom:1px solid black" />
    <SortableList
      {listId}
      options={sortableOptions}
      liClass="item"
      ulClass="list"
      on:changed={listChanged(listId)}
      bind:items={lists[listId]}
      let:item
      {getItemById}>
      <div class="item-border">Hey, it's {item.text}!</div>
    </SortableList>
  {/each}
</div>
