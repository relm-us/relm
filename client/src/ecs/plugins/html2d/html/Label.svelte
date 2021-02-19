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
      // TODO: use selectionLogic to implement complete set of selection possibilities
      $wm.selection.addEntityId(entity.id);
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
    /* Line clamp with ellipsis; see https://stackoverflow.com/a/32585024/159344 */
    line-height: 1.4rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;

    font-family: Verdana, Geneva, Tahoma, sans-serif;
    color: var(--color, #e5e5e5);
    letter-spacing: 1px;
    font-weight: 700;
    text-shadow: 0 0 3px var(--shadow-color, "black");

    padding: 4px 8px;
    cursor: default;
  }

  div:hover {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 5px;
    display: block;
  }
</style>
