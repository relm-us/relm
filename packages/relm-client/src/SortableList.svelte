<script>
  import { flip } from "svelte/animate";
  import {
    dndzone,
    TRIGGERS,
    SHADOW_ITEM_MARKER_PROPERTY_NAME,
  } from "svelte-dnd-action";

  import { dragSource, dragDest } from "./dragStore";

  import { createEventDispatcher } from "svelte";
  import { uuidv4 } from "~/utils/uuid";
  import { derived } from "svelte/store";

  export let items;
  export let name;
  export let category;

  const dispatch = createEventDispatcher();
  const FLIP_DURATION = 200;

  let itemsIfCopied = null;
  let itemsIfMoved = null;
  let itemsWithPlaceholder = null;
  let action;

  name;

  derived([dragSource, dragDest], ([$dragSource, $dragDest]) => {
    if ($dragDest !== null && $dragDest.category === "trash") {
      action = "move";
    } else if (
      $dragDest !== null &&
      $dragDest.category !== $dragSource.category
    ) {
      action = "copy";
    } else {
      action = "move";
    }

    if (action === "copy") {
      if (itemsIfCopied) {
        items = itemsIfCopied;
      }
    } else if (action === "move") {
      if (itemsIfMoved) {
        if (
          ($dragDest === null || $dragDest.id === $dragSource.id) &&
          itemsWithPlaceholder
        ) {
          items = itemsWithPlaceholder;
        } else {
          items = itemsIfMoved;
        }
      }
    }
  }).subscribe(() => {});

  function consider({ detail }) {
    const { trigger, id } = detail.info;

    if (trigger === TRIGGERS.DRAG_STARTED) {
      dragSource.set({ category, id: name });
      dragDest.set(null);
    } else if (trigger === TRIGGERS.DRAGGED_ENTERED) {
      dragDest.set({ category, id: name });
    } else if (trigger === TRIGGERS.DRAGGED_LEFT) {
      dragDest.set(null);
    }

    if (trigger === TRIGGERS.DRAG_STARTED) {
      itemsIfMoved = [...detail.items];

      const idx = items.findIndex((item) => item.id === id);
      if (idx === -1) {
        console.warn(id, "not found in", items);
        throw new Error("not found");
      }
      detail.items.splice(idx, 0, {
        id: uuidv4(),
        originalId: id,
        name: items[idx].name,
      });
      itemsIfCopied = [...detail.items];
      itemsWithPlaceholder = null;

      items = itemsIfMoved;
    } else if (trigger === TRIGGERS.DRAGGED_ENTERED) {
      const idx = items.findIndex((item) => item.id === id);
      const dragItem = items[idx];

      let matchIdx = -1;
      if (idx >= 0) {
        matchIdx = detail.items.findIndex(
          (item) => item.originalId === dragItem.id
        );
      }

      if (matchIdx === -1) {
        items = itemsWithPlaceholder = [...detail.items];
      }
    } else if (trigger === TRIGGERS.DRAGGED_LEFT_ALL) {
      // do nothing
    } else {
      items = detail.items;
    }
  }

  function finalize({ detail }) {
    const { id } = detail.info;
    const idx = items.findIndex((item) => item.id === id);
    const dragItem = items[idx];

    items = detail.items.map((item) => {
      if (item.originalId) {
        // Restore a dragged item's original ID. (When a copy event
        // starts, we had to make a copy of the original and keep
        // it in place, moving the original as the dragged item)
        return {
          id: item.originalId,
          name: item.name,
        };
      } else if (action === "copy" && dragItem && dragItem.id === item.id) {
        // Create a copy of an item in its final destination
        return {
          id: uuidv4(),
          oid: item.id,
          name: item.name,
        };
      } else {
        // Regular item, i.e. the user didn't touch it
        return item;
      }
    });

    itemsIfCopied = null;
    itemsIfMoved = null;
    itemsWithPlaceholder = null;
  }
</script>

<style>
  section {
    display: flex;
    flex-wrap: wrap;
    width: 220px;
    min-height: 100px;
    border: 1px dashed orange;
    margin: 8px;
  }

  item {
    display: block;
    position: relative;

    width: 100px;
    height: 100px;

    cursor: pointer;
    border: 1px solid black;

    margin: 4px;
  }

  item.custom-shadow-item {
    background-color: rgba(0, 0, 0, 0.5);

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    visibility: visible;
    border: 1px dashed grey;
    background: lightblue;
    opacity: 0.5;
    margin: 0;
  }
</style>

<section
  use:dndzone={{ items, flipDurationMs: FLIP_DURATION }}
  on:consider={consider}
  on:finalize={finalize}>
  {#each items as item (item.id)}
    <item data-id={item.id} animate:flip={{ duration: FLIP_DURATION }}>
      <slot {item}>{item.name}<br />{item.id}</slot>
      {#if item[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
        <item class="custom-shadow-item">{item.name}<br />{item.id}</item>
      {/if}
    </item>
  {/each}
</section>
