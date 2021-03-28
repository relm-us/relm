<script>
  import { Vector2 } from "three";
  import { cleanHtml } from "~/utils/cleanHtml";

  import { Html2d } from "../components";
  import { Relm } from "~/stores/Relm";
  import { mode } from "~/stores/mode";
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

  const initialMousePos = new Vector2();
  const mousePos = new Vector2();

  function doneEditing() {
    if (!editing) return;
    editing = false;

    const text = labelEl.innerHTML;
    const component = entity.get(Html2d);
    component.content = text;

    if ($Relm.avatar === entity) {
      // TODO: make a way for Avatar to subscribe to ECS component
      // changes instead of this hack:
      $Relm.identities.me.setName(text);
    } else {
      // Broadcast changes
      $Relm.wdoc.syncFrom(entity);
    }
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
    if ($mode === "build") {
      event.preventDefault();
      // Uses setTimeout because a click on "nothing" will deselect everything
      // TODO: use selectionLogic to implement complete set of selection possibilities
      setTimeout(() => {
        $Relm.selection.clear();
        $Relm.selection.addEntityId(entity.id);
      }, 100);
    } else if ($mode === "play") {
      var rect = event.target.parentElement.getBoundingClientRect();
      initialMousePos.set(event.clientX - rect.left, event.clientY - rect.top);
      clickStarted = true;
    }
  }

  function onMouseup(_event) {
    if (dragging) {
      $Relm.wdoc.syncFrom(entity);
      dragging = false;
    } else if (clickStarted && editable) {
      editing = true;
      setTimeout(() => labelEl.focus(), 100);
    }
    clickStarted = false;
  }

  function onMousemove(event) {
    if (!editing) event.preventDefault();

    if (!event.target.parentElement) return;

    var rect = event.target.parentElement.getBoundingClientRect();
    mousePos.set(event.clientX - rect.left, event.clientY - rect.top);

    if (
      draggable &&
      clickStarted &&
      mousePos.distanceTo(initialMousePos) > DRAG_DISTANCE_THRESHOLD
    ) {
      // this is the start of a drag
      dragging = true;
    }

    if (!dragging) return;

    const drag = $Relm.world.presentation.getWorldFromScreenCoords(
      event.clientX - initialMousePos.x,
      event.clientY - initialMousePos.y
    );

    const position = entity.getByName("Transform").position;
    position.x = drag.x;
    position.z = drag.z;
  }

  // ignore warning about missing props
  $$props;
</script>

<div
  contenteditable={editing}
  class="truncate-overflow"
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
