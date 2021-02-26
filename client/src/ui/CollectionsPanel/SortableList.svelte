<script>
  import { flip } from "svelte/animate";
  import {
    dndzone,
    TRIGGERS,
    SHADOW_ITEM_MARKER_PROPERTY_NAME,
  } from "svelte-dnd-action";
  import { assetUrl } from "~/config/assetUrl";
  import { globalEvents } from "~/events";

  import { dropzones } from "./dropzones";

  export let list;
  export let items;

  const FLIP_DURATION = 200;

  function consider(event) {
    if (event.detail.info.trigger === TRIGGERS.USER_DROPPED) {
      const mouse = event.detail.info.pointerClientXY;
      const els = Array.from(document.elementsFromPoint(mouse.x, mouse.y));

      let dropzoneId;
      let viewport;
      for (const el of els) {
        if (el.dataset.dropzoneId) {
          dropzoneId = el.dataset.dropzoneId;
        }
        if (el.tagName === "VIEWPORT") {
          viewport = el;
        }
      }

      const item = event.detail.items.find(
        (i) => i.id === event.detail.info.id
      );
      delete item[SHADOW_ITEM_MARKER_PROPERTY_NAME];

      if (dropzoneId) {
        const dz = dropzones.get(dropzoneId);
        // don't allow dropping on "self"
        if (dz.list.id !== list.id) {
          dz.dispatch("drop", { item, list });
          dz.active.set(true);
          // no animation
          event.preventDefault();
        }
      } else if (viewport) {
        globalEvents.emit("drop-item", { item });
      } else {
        console.log("dropped onto nothing", els);
      }
    } else {
      items = event.detail.items;
    }
  }

  function finalize({ detail }) {
    items = detail.items;
  }
</script>

<section
  use:dndzone={{
    items,
    flipDurationMs: FLIP_DURATION,
    dropTargetStyle: "",
  }}
  on:consider={consider}
  on:finalize={finalize}
>
  {#each items as item (item.id)}
    <item
      data-id={item.id}
      animate:flip={{ duration: FLIP_DURATION }}
      on:click={() => globalEvents.emit("drop-item", { item })}
    >
      {#if item.thumbnail}
        <img src={assetUrl(item.thumbnail)} alt="thumbnail" />
      {:else}{item.name}<br />{item.id}{/if}
      {#if item[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
        <item class="custom-shadow-item">
          {#if item.thumbnail}
            <img src={assetUrl(item.thumbnail)} alt="thumbnail" />
          {:else}{item.name}<br />{item.id}{/if}
        </item>
      {/if}
    </item>
  {/each}
</section>

<style>
  section {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    width: 208px;
    height: 100%;
    padding-bottom: 120px;

    /* hide scroll bars */
    overflow-y: scroll;
    -ms-overflow-style: none; /* Internet Explorer 10+ */
    scrollbar-width: none; /* Firefox */
  }
  section::-webkit-scrollbar {
    /* hide scroll bars */
    display: none; /* Safari and Chrome */
  }
  section:focus {
    outline: none;
  }

  item {
    display: flex;
    position: relative;

    width: 95px;
    height: 95px;

    cursor: pointer;
    border-radius: 5px;
    border: 1px solid rgba(200, 200, 200, 0.5);

    margin: 4px 0px 4px 4px;

    overflow: hidden;
  }

  item.custom-shadow-item {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    visibility: visible;
    opacity: 0.5;
    margin: 0;
  }

  img {
    display: flex;
    width: 100%;
    object-fit: contain;
  }
</style>
