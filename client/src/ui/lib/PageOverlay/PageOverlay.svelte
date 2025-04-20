<script>
import { fade } from "svelte/transition"

export let zIndex = 3
export let justify = "flex-start"
</script>

<page-overlay out:fade style="z-index: {zIndex}; justify-content: {justify}">
  <slot />
</page-overlay>

<style>
  page-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;

    position: fixed;
    top: 0;
    overflow-y: auto;
    width: 100%;
    height: 100%;

    background: var(--background-gray);
    color: white;
  }
</style>
