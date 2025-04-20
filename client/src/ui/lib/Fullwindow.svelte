<script lang="ts">
import { onMount, createEventDispatcher } from "svelte"

export let active = true
export let zIndex = 100

const dispatch = createEventDispatcher()

let el: HTMLElement
let parentEl

function onClick(event) {
  if (event.target === el) dispatch("close", event.target)
  else dispatch("click", event.target)
}

$: if (parentEl) {
  if (active && el.parentElement !== document.body) {
    // Move the containing element to document.body so that
    // "fullwindow" mode can escape absolute/relative positioned
    // elements and take up the whole window.
    document.body.appendChild(el)
  } else if (!active && el.parentElement !== parentEl) {
    // Move back to the original parent element
    parentEl.appendChild(el)
  }
}

onMount(() => {
  parentEl = el.parentElement
})
</script>

<fullwindow bind:this={el} style="z-index: {zIndex}" on:click={onClick}>
  <slot />
</fullwindow>

<style>
  fullwindow {
    display: block;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
</style>
