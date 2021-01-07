<script>
  import { createEventDispatcher } from "svelte";
  import { uuidv4 } from "~/utils/uuid";
  const dispatch = createEventDispatcher();

  // import Sortable from "sortablejs/modular/sortable.core.esm.js";
  import Sortable from "sortablejs";

  // optionally set an ID for the list itself
  export let listId;

  // every item is an object with a unique ID for identification
  export let items = [];
  export let idKey = "id"; // id attribute changeable if needed
  export let ulClass = "";
  export let liClass = "";
  export let getItemById = undefined;
  export let options = {};

  // We'll need a new object that we can modify internal to this component for sortablejs options
  const sortableOptions = Object.assign({}, options);

  // console.log("sortableOptions A", sortableOptions.id, sortableOptions.store);
  if (sortableOptions.dataIdAttr)
    throw new Error("sortableOptions.dataIdAttr is currently not supported.");
  sortableOptions.store = sortableOptions.store || {
    set: (sortable) => undefined, // placeholder
  };
  if (sortableOptions.group && !getItemById) {
    throw new Error(
      "When using group, please provide a function called `getItemById` " +
        "(as a prop) that gives an item in case it gets dropped from somewhere " +
        "else. Otherwise, the SortableList cannot know what the item is exactly."
    );
  }
  getItemById =
    getItemById ||
    ((id) => {
      return items.find((item) => item[idKey] == id); // should only loosely check as IDs are auto-converted to strings
    });

  let _store_set = sortableOptions.store.set;
  sortableOptions.store.set = (sortable) => {
    _store_set(sortable); // still call old set callback function
    items = sortable.toArray().map(getItemById);
    dispatch("changed", items);
  };

  /*
  sortableOptions.store.set = (sortable) => {
    _store_set(sortable); // still call old set callback function

    const oldIds = items.map((item) => item.id.toString());

    const itemIds = sortable.toArray();
    const changedItems = {};

    const itemEls = Array.from(listElement.childNodes);
    for (const itemEl of itemEls) {
      const itemId = itemEl.dataset.id;
      if (!oldIds.includes(itemId)) {
        // itemId was just added
        if (sortable.lastPutMode === "clone") {
          console.log("remove itemEl", itemEl);
          itemEl.remove();
          changedItems[itemId] = true;
        }
      }
    }

    items = itemIds.map((id) => {
      let item = getItemById(id);
      if (changedItems[id]) {
        item = Object.assign({}, item);
        item.id = uuidv4();
      }
      return item;
    });

    dispatch("changed", items);
  };
  */

  let sortable;
  let listElement;
  $: if (listElement && !sortable && sortableOptions.store) {
    sortable = Sortable.create(listElement, sortableOptions);
    sortable.listId = listId;
  }

  $: for (let item of items) {
    if (!item || item[idKey] === null || item[idKey] === undefined) {
      throw new Error(`Item '${item}' has no valid ${idKey}`);
    }
  }
</script>

<div bind:this={listElement} class={ulClass}>
  {#each items as item (item[idKey])}
    <div class={liClass} data-id={item[idKey]}>
      <slot {item}>{item}</slot>
    </div>
  {/each}
</div>
