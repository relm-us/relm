<script lang="ts">
  import { cleanHtml } from "~/utils/cleanHtml";
  import IoMdCreate from "svelte-icons/io/IoMdCreate.svelte";

  import { Html2d } from "../components";
  import { worldManager } from "~/world";
  import { worldUIMode } from "~/stores/worldUIMode";

  export let content;
  export let color;
  export let shadowColor;
  export let underlineColor;
  export let editable;
  export let visible;

  // The entity that this Label is attached to
  export let entity;

  let labelEl;
  let editing = false;
  let showEditIcon = false;
  let hasContent = content && content.length > 0;

  $: showEditIcon = editable && !hasContent;

  function doneEditing() {
    if (!editing) return;

    const html2d: Html2d = entity.get(Html2d);
    html2d.content = content = labelEl.innerText.trim();

    if (html2d.onChange) {
      html2d.onChange(content);
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
    } else {
      // slightly faster visual response than keyup
      hasContent = true;
    }
  }

  function onKeyup(event) {
    hasContent = labelEl.innerText.trim().length > 0;
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

  function selectAll(div) {
    const range = document.createRange();
    range.selectNodeContents(div);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // ignore warning about missing props
  $$props;
</script>

{#if visible}
  <r-label>
    {#if showEditIcon}
      <icon on:mousedown={onMousedown}><IoMdCreate /></icon>
    {/if}
    <div
      contenteditable={editing}
      class="truncate-overflow interactive"
      class:underline={!!underlineColor}
      style="--color:{color};--shadow-color:{shadowColor};--underline-color:{underlineColor}"
      bind:this={labelEl}
      on:mousedown={onMousedown}
      on:blur={doneEditing}
      on:keydown={onKeydown}
      on:keyup={onKeyup}
    >
      {@html cleanHtml(content)}
    </div>
  </r-label>
{/if}

<style>
  r-label {
    display: flex;
    align-items: center;
    position: relative;
  }
  div {
    overflow: hidden;
    hyphens: auto;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-break: break-word;
    flex-grow: 1;

    /* font-family: Verdana, Geneva, Tahoma, sans-serif; */
    color: var(--color, #e5e5e5);
    letter-spacing: 1.2px;
    font-weight: 700;
    line-height: 1.5rem;
    min-height: 1.5rem;
    text-shadow: 0 0 3px var(--shadow-color, "black");

    padding: 4px 8px;
    cursor: default;
  }

  div.underline {
    border-bottom: 2px solid var(--underline-color);
  }

  div:hover {
    background-color: rgba(0, 0, 0, 0.15);
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  icon {
    display: block;
    width: 18px;
    height: 18px;
    color: white;
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    padding: 3px 2px 3px 3px;
    margin-right: 4px;

    position: absolute;
    left: -24px;
  }
  icon:hover {
    background-color: rgba(80, 80, 80, 0.15);
  }
</style>
