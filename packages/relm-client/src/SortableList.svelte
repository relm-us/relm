<script>
  import { flip } from "svelte/animate";
  import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from "svelte-dnd-action";

  import { dropzones } from "./dropzones";

  export let list;
  export let items;

  const FLIP_DURATION = 200;

  function acceptItems({ detail }) {
    items = detail.items;
  }

  function customDrop(item, mouse) {
    const els = Array.from(document.elementsFromPoint(mouse.x, mouse.y));

    let dropzoneId;
    for (const el of els) {
      if (el.dataset.dropzoneId) {
        dropzoneId = el.dataset.dropzoneId;
      }
    }

    if (dropzoneId) {
      const dz = dropzones.get(dropzoneId);
      // don't allow dropping on "self"
      if (dz.list.id !== list.id) {
        dz.dispatch("drop", { item, list });
        dz.active.set(true);
        // no animation
        return false;
      }
    }
  }
</script>

<style>
  section {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    width: 220px;
    height: 100%;
    border: 1px dashed orange;
    overflow: scroll;

    margin-top: 8px;
    margin-bottom: 8px;
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
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    visibility: visible;
    /* border: 1px dashed grey;
    background: lightblue; */
    opacity: 0.5;
    margin: 0;
  }
</style>

<section
  use:dndzone={{ items, flipDurationMs: FLIP_DURATION, customDrop }}
  on:consider={acceptItems}
  on:finalize={acceptItems}>
  {#each items as item (item.id)}
    <item data-id={item.id} animate:flip={{ duration: FLIP_DURATION }}>
      <slot {item}>{item.name}<br />{item.id}</slot>
      {#if item[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
        <item class="custom-shadow-item">{item.name}<br />{item.id}</item>
      {/if}
    </item>
  {/each}
</section>
