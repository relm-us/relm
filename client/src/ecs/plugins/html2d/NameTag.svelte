<script lang="ts">
  import { Color, HSL } from "three";

  import { cleanHtml } from "~/utils/cleanHtml";
  import { selectAll } from "~/utils/selectAll";
  import { worldManager } from "~/world";
  import { worldUIMode } from "~/stores/worldUIMode";

  import { Oculus } from "./components";
  import { Entity } from "~/ecs/base";

  export let name: string = "";
  export let color: string;
  export let editable: boolean = true;
  export let entity: Entity;

  let fgColor = "black";

  let labelEl;
  let editing = false;

  $: {
    // Choose a foreground text color with enough contrast
    // to show up, regardless of background color
    let hsl: HSL = { h: 0, s: 0, l: 0 };
    new Color(color).getHSL(hsl).l;
    if (hsl.l < 0.5) fgColor = "white";
    else fgColor = "black";
  }

  function doneEditing() {
    if (!editing) return;

    const oculus: Oculus = entity.get(Oculus);
    oculus.name = name = labelEl.innerText.trim();

    if (oculus.onChange) {
      oculus.onChange(name);
    } else {
      // Broadcast changes
      worldManager.worldDoc.syncFrom(entity);
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
      event.stopPropagation();
      event.target.blur();
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
    } else if (editable && !editing) {
      editing = true;
      setTimeout(() => {
        labelEl.focus();
        selectAll(labelEl);
      }, 100);
    }
  }
</script>

<r-name-tag>
  <span
    contenteditable={editing}
    style="--name-bg-color: {color}; --name-color: {fgColor}"
    on:mousedown={onMousedown}
    bind:this={labelEl}
    on:keydown={onKeydown}
    on:blur={doneEditing}
    data-placeholder="Add your name">{@html cleanHtml(name)}</span
  >
</r-name-tag>

<style>
  r-name-tag {
    position: absolute;
    bottom: -12px;

    left: 50%;
    transform: translateX(-50%);

    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* r-name-tag span {
  } */
  /* r-name-tag span::after {
    content: " ";
  } */

  span {
    display: block;
    outline: 0px solid transparent;

    background: var(--name-bg-color, white);
    color: var(--name-color, black);

    min-width: 30px;
    max-width: 120px;
    height: 20px;
    text-align: center;
    border-radius: 12px;
    white-space: nowrap;
    padding: 0 6px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span:empty:before {
    color: #999;
    content: attr(data-placeholder);
  }
</style>
