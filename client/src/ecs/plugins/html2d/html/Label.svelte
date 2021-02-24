<script>
  import { Relm } from "~/stores/Relm";
  import { mode } from "~/stores/mode";
  import { cleanHtml } from "~/utils/cleanHtml";

  export let content;
  export let color;
  export let shadowColor;
  export let underlineColor;
  export let draggable;

  // The entity that this Label is attached to
  export let entity;

  // let canEdit = false;
  let labelEl;
  let dragging = false;
  let dragStart = {};

  function onMousedown(event) {
    if ($mode === "build") {
      event.preventDefault();
      // Uses setTimeout because a click on "nothing" will deselect everything
      // TODO: use selectionLogic to implement complete set of selection possibilities
      setTimeout(() => {
        $Relm.selection.addEntityId(entity.id);
      }, 100);
    } else if ($mode === "play") {
      // canEdit = true;
      if (!draggable) return;
      var rect = event.target.parentElement.getBoundingClientRect();
      dragStart = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      dragging = true;
    }
  }

  function onMouseup(_event) {
    if (dragging) {
      $Relm.wdoc.syncFrom(entity);
      dragging = false;
    }
  }

  function onMousemove(event) {
    if (!dragging) return;
    event.preventDefault();

    const drag = $Relm.world.presentation.getWorldFromScreenCoords(
      event.clientX - dragStart.x,
      event.clientY - dragStart.y
    );

    const position = entity.getByName("Transform").position;
    position.x = drag.x;
    position.z = drag.z;
  }

  // ignore warning about missing props
  $$props;
</script>

<!-- contenteditable={canEdit} -->
<div
  class="truncate-overflow"
  class:underline={!!underlineColor}
  style="--color:{color};--shadow-color:{shadowColor};--underline-color:{underlineColor}"
  bind:this={labelEl}
  on:mousedown={onMousedown}
>
  {@html cleanHtml(content)}
</div>

<svelte:window on:mousemove={onMousemove} on:mouseup={onMouseup} />

<style>
  div {
    overflow: hidden;
    hyphens: auto;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-break: break-word;

    /* font-family: Verdana, Geneva, Tahoma, sans-serif; */
    color: var(--color, #e5e5e5);
    letter-spacing: 1.2px;
    font-weight: 700;
    line-height: 1.5rem;
    text-shadow: 0 0 3px var(--shadow-color, "black");

    padding: 4px 8px;
    cursor: default;
  }
  div :global(a),
  div :global(a:visited) {
    color: var(--color, #e5e5e5);
    text-decoration: underline;
  }

  div.underline {
    border-bottom: 2px solid var(--underline-color);
  }

  div:hover {
    position: relative;

    display: block;
    /* min-width: 300px; */

    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 5px;

    white-space: normal;
  }
</style>
