<script lang="ts">
  import { worldManager } from "~/world";
  import { worldUIMode } from "~/stores/worldUIMode";
  import { cleanHtml } from "~/utils/cleanHtml";

  import { Renderable } from "../components";

  export let width: number;
  export let height: number;
  export let fontSize: number;
  export let text: string;
  export let fontColor: string;
  export let bgColor: string;
  export let borderColor: string;
  export let editable: boolean;
  export let entity;

  let canEdit = false;

  $: canEdit = $worldUIMode === "play" && editable;

  function onInput(event) {
    const text = event.target.innerHTML;

    const renderable = entity.get(Renderable);
    renderable.text = text;
    worldManager.$wdoc.syncFrom(entity);
  }

  // ignore warning about missing props
  $$props;
</script>

<!-- <div style="--width:{width}px; --height:{height}px">{text}</div> -->
<container
  on:input={onInput}
  contenteditable={canEdit ? "true" : undefined}
  style="--width:{width}px;--height:{height}px;--size:{fontSize}px;--color:{fontColor};--bgColor:{bgColor};--borderColor:{borderColor};"
>
  {@html cleanHtml(text)}
</container>
  <!-- <resizer-left /> -->
  <!-- <resizer-right /> -->

<style>
  container {
    position: relative;

    display: flex;
    flex-direction: column;
    justify-content: center;

    font-weight: bold;
    font-size: var(--size, 20px);
    font-family: Arial, sans;
    text-align: center;

    color: var(--color, white);
    background-color: var(--bgColor, black);
    width: calc(var(--width, 200px) - 8px);
    height: calc(var(--height, 50px) - 8px);
    border: 4px solid var(--borderColor, black);

    overflow: auto;
    word-break: break-word;
  }

  /* resizer-left {
    position: absolute;

    left: 0;
    top: 0;
    width: 8px;
    height: 100%;

    cursor: ew-resize;
  }

  resizer-right {
    position: absolute;

    right: 0;
    top: 0;
    width: 8px;
    height: 100%;

    cursor: ew-resize;
  } */
</style>
