<script>
  import { mode } from "~/stores/mode";
  import { worldManager as wm } from "~/stores/worldManager";

  export let content;
  export let color;
  export let shadowColor;

  // The entity that this Label is attached to
  export let entity;

  function onMousedown(event) {
    event.preventDefault();
    if ($mode === "build") {
      // Uses setTimeout because a click on "nothing" will deselect everything
      // TODO: use selectionLogic to implement complete set of selection possibilities
      setTimeout(() => {
        $wm.selection.addEntityId(entity.id);
      }, 10);
    }
  }

  // ignore warning about missing props
  $$props;
</script>

<div
  class="truncate-overflow"
  style="--color:{color};--shadow-color:{shadowColor};"
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

    font-family: Verdana, Geneva, Tahoma, sans-serif;
    color: var(--color, #e5e5e5);
    letter-spacing: 1px;
    font-weight: 700;
    text-shadow: 0 0 3px var(--shadow-color, "black");

    padding: 4px 8px;
    cursor: default;
  }

  div:hover {
    position: relative;

    display: block;
    min-width: 300px;

    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 5px;

    white-space: normal;
  }
</style>
