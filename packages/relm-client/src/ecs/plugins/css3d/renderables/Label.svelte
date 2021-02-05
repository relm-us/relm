<script lang="ts">
  import { worldManager as wm } from "~/stores/worldManager";
  import { mode } from "~/stores/mode";
  import { cleanHtml } from "~/utils/cleanHtml";

  import { Renderable } from "../components";

  export let width: number;
  export let height: number;
  export let fontSize: number;
  export let text: string;
  export let fontColor: string;
  export let bgColor: string;
  export let editable: boolean;
  export let entity;

  let canEdit = false;

  $: canEdit = $mode === "play" && editable;

  function onInput(event) {
    const text = event.target.innerHTML;

    const renderable = entity.get(Renderable);
    renderable.text = text;
    $wm.wdoc.syncFrom(entity);
  }

  // ignore warning about missing props
  $$props;
</script>

<!-- <div style="--width:{width}px; --height:{height}px">{text}</div> -->
<div
  on:input={onInput}
  contenteditable={canEdit ? "true" : undefined}
  style="--width:{width}px;--height:{height}px;--size:{fontSize}px;--color:{fontColor};--bgColor:{bgColor};"
>
  {@html cleanHtml(text)}
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    justify-content: center;

    font-weight: bold;
    font-size: var(--size, 20px);
    font-family: Arial, sans;
    text-align: center;

    color: var(--color, white);
    background-color: var(--bgColor, black);
    width: var(--width, 200px);
    height: var(--height, 50px);

    overflow: auto;
  }
</style>
