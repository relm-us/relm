<script lang="ts">
import { onMount, createEventDispatcher } from "svelte"
import IoIosClose from "svelte-icons/io/IoIosClose.svelte"

export let active = true
export let closing = false
export let zIndex = 100

const dispatch = createEventDispatcher()

let el: HTMLElement
let parentEl

function onClick(event) {
  if (event.target === el) onClose(event)
  else dispatch("click", event.target)
}
function onClose(event) {
  closing = true
  dispatch("close", event.target)
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

<!-- svelte-ignore a11y-click-events-have-key-events -->
<r-fullwindow bind:this={el} style="z-index: {zIndex}" on:click={onClick}>
  {#if !closing}
    <r-upper-left-corner>
      <button on:click={onClose}><IoIosClose /></button>
    </r-upper-left-corner>
  {/if}
  <slot />
</r-fullwindow>

<style>
  r-fullwindow {
    display: block;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  r-upper-left-corner {
    position: absolute;
    left: 20px;
    top: 20px;
  }

  button {
    display: block;
    width: 48px;
    height: 48px;
    margin: 0 auto;

    color: white;
    background-color: var(--background-transparent-gray);

    border: 0;
    padding: 0;
    border-radius: 100%;
    pointer-events: all;
  }
  button:hover {
    background-color: var(--background-gray);
  }
  button :global(path) {
    stroke-width: 12px;
    stroke: black;
  }
</style>
