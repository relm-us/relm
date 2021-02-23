<script>
  import { Relm } from "~/stores/Relm";
  import { mode } from "~/stores/mode";

  export let content;
  export let color;
  export let shadowColor;
  export let underlineColor;

  // The entity that this Label is attached to
  export let entity;

  let canEdit = false;

  function onMousedown(event) {
    if ($mode === "build") {
      event.preventDefault();
      // Uses setTimeout because a click on "nothing" will deselect everything
      // TODO: use selectionLogic to implement complete set of selection possibilities
      setTimeout(() => {
        $Relm.selection.addEntityId(entity.id);
      }, 100);
    } else if ($mode === "play") {
      canEdit = true;
    }
  }

  // ignore warning about missing props
  $$props;
</script>

<!-- contenteditable={canEdit} -->
<div
  class="truncate-overflow"
  class:underline={!!underlineColor}
  style="--color:{color};--shadow-color:{shadowColor};--underline-color:{underlineColor}"
  on:mousedown={onMousedown}
>
  {content}
</div>

<style>
  div {
    line-height: 1.5rem;
    overflow: hidden;
    hyphens: auto;
    white-space: nowrap;
    text-overflow: ellipsis;

    /* font-family: Verdana, Geneva, Tahoma, sans-serif; */
    color: var(--color, #e5e5e5);
    letter-spacing: 1.2px;
    font-weight: 700;
    text-shadow: 0 0 3px var(--shadow-color, "black");

    padding: 4px 8px;
    cursor: default;
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
