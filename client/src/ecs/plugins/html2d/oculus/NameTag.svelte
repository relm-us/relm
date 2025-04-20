<script lang="ts">
import { Color, type HSL } from "three"
import { onMount, createEventDispatcher } from "svelte"
import { fade } from "svelte/transition"

import { cleanHtml } from "~/utils/cleanHtml"
import { selectAll } from "~/utils/selectAll"
import { getAncestor } from "~/utils/hasAncestor"
import { worldUIMode } from "~/stores/worldUIMode"
import { _ } from "svelte-i18n"

export let name: string = ""
export let color: string
export let editable: boolean = true

const dispatch = createEventDispatcher()

let fgColor = "black"

let labelEl, nameTagEl
let editing = false
let visible = true

$: {
  // Choose a foreground text color with enough contrast
  // to show up, regardless of background color
  let hsl: HSL = { h: 0, s: 0, l: 0 }
  new Color(color).getHSL(hsl).l
  if (hsl.l < 0.5) fgColor = "white"
  else fgColor = "black"
}

function doneEditing() {
  if (!editing) return

  const name = labelEl.innerText.trim()
  dispatch("change", { name })

  editing = false
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
    event.preventDefault()
    event.stopPropagation()
    event.target.blur()
  }
}

function onPointerdown(event) {
  if ($worldUIMode === "play" && editable && !editing) {
    editing = true
    setTimeout(() => {
      labelEl.focus()
      selectAll(labelEl)
    }, 100)
  }
}

// Make NameTag appear & disappear based on size of Oculus
onMount(() => {
  const interval = setInterval(() => {
    const parent = getAncestor(nameTagEl, "r-html2d")
    if (parent) {
      visible = parseFloat(parent.style.width) > 60
    }
  }, 151)
  return () => clearInterval(interval)
})
</script>

<r-name-tag bind:this={nameTagEl}>
  {#if visible}
    <r-label
      contenteditable={editing}
      data-placeholder={editable ? $_("NameTag.add_your_name") : undefined}
      style="--name-bg-color: {color}; --name-color: {fgColor}"
      class:thin={!editable && name === ""}
      bind:this={labelEl}
      on:pointerdown={onPointerdown}
      on:keydown={onKeydown}
      on:blur={doneEditing}
      transition:fade>{@html cleanHtml(name)}</r-label
    >
  {/if}
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

    pointer-events: all;
  }

  r-label {
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
    padding: 2px 8px 1px 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 18px;
  }

  r-label:empty:before {
    content: attr(data-placeholder);
  }

  .thin {
    height: 6px;
    margin-bottom: 8px;
  }
</style>
