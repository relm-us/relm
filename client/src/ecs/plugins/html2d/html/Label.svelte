<script>
  import { Vector2, Vector3 } from "three";
  import { cleanHtml } from "~/utils/cleanHtml";

  import { Html2d } from "../components";
  import { worldManager } from "~/world";
  import { worldUIMode } from "~/stores/worldUIMode";
  import { DRAG_DISTANCE_THRESHOLD } from "~/config/constants";

  export let content;
  export let color;
  export let shadowColor;
  export let underlineColor;
  export let draggable;
  export let editable;

  // The entity that this Label is attached to
  export let entity;

  let labelEl;
  let clickStarted = false;
  let dragging = false;
  let editing = false;
  let showNoteIcon = false;

  $: showNoteIcon = editable && !editing && content === "";

  const initialEntityPos = new Vector3();
  const initialMousePos = new Vector2();

  function doneEditing() {
    if (!editing) return;

    content = labelEl.innerHTML;
    const component = entity.get(Html2d);
    component.content = content;

    if (worldManager.avatar.entity === entity) {
      // TODO: make a way for Avatar to subscribe to ECS component
      // changes instead of this hack:
      worldManager.identities.me.set({ name: content });
    } else {
      // Broadcast changes
      worldManager.wdoc.syncFrom(entity);
    }

    editing = false;
  }

  function onKeydown(event) {
    if (
      event.key === "Tab" ||
      event.key === "Escape" ||
      /**
       * `enter` means "done", except when shift key is
       * pressed, in which case `enter` means "newline"
       */
      ((event.key === "Enter" || event.key === "Return") && !event.shiftKey)
    ) {
      event.preventDefault();
      doneEditing();
    }
  }

  function onMousedown(event) {
    if ($worldUIMode === "build") {
      event.preventDefault();
      // Uses setTimeout because a click on "nothing" will deselect everything
      // TODO: use selectionLogic to implement complete set of selection possibilities
      setTimeout(() => {
        worldManager.selection.clear();
        worldManager.selection.addEntityId(entity.id);
      }, 100);
    } else if ($worldUIMode === "play") {
      const mouse2d = worldManager.world.presentation.mouse2d;
      // Store the original click in 3d world coords
      worldManager.world.perspective.getWorldFromScreen(mouse2d, initialEntityPos);
      initialEntityPos.sub(entity.getByName("Transform").position);

      initialMousePos.copy(mouse2d);
      clickStarted = true;
    }
  }

  function onMouseup(_event) {
    if (dragging) {
      worldManager.wdoc.syncFrom(entity);
      dragging = false;
    } else if (clickStarted && editable && !editing) {
      editing = true;
      setTimeout(() => labelEl.focus(), 100);
    }
    clickStarted = false;
  }

  function onMousemove(event) {
    if (!editing) event.preventDefault();

    if (!event.target.parentElement) return;

    const mouse2d = worldManager.world.presentation.mouse2d;

    if (
      draggable &&
      clickStarted &&
      mouse2d.distanceTo(initialMousePos) > DRAG_DISTANCE_THRESHOLD
    ) {
      // this is the start of a drag
      dragging = true;
    }

    if (!dragging) return;

    const drag = worldManager.world.perspective.getWorldFromScreen(mouse2d);
    drag.x -= initialEntityPos.x;
    drag.z -= initialEntityPos.z;

    const position = entity.getByName("Transform").position;
    position.x = drag.x;
    position.z = drag.z;
  }

  // ignore warning about missing props
  $$props;
</script>

{#if showNoteIcon}
  <div on:mousedown={onMousedown}>✎</div>
{:else}
  <div
    contenteditable={editing}
    class="truncate-overflow interactive"
    class:underline={!!underlineColor}
    class:dragging
    style="--color:{color};--shadow-color:{shadowColor};--underline-color:{underlineColor}"
    bind:this={labelEl}
    on:mousedown={onMousedown}
    on:blur={doneEditing}
    on:keydown={onKeydown}
  >
    {@html cleanHtml(content)}
  </div>
{/if}

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

  div:hover,
  .dragging {
    position: relative;

    display: block;
    /* min-width: 300px; */

    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 5px;

    white-space: normal;
  }
</style>
