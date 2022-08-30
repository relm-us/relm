<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";

  export let active = true;
  export let zIndex = 100;

  const dispatch = createEventDispatcher();

  let el: HTMLElement;
  let parentEl;
  let style;

  function onClick(event) {
    if (event.target === el) dispatch("close", event.target);
    else dispatch("click", event.target);
  }

  $: if (parentEl) {
    if (active && el.parentElement !== document.body) {
      // Move the containing element to document.body so that
      // "fullwindow" mode can escape absolute/relative positioned
      // elements and take up the whole window.
      document.body.appendChild(el);
      style = `z-index: ${zIndex}`;
    } else if (!active && el.parentElement !== parentEl) {
      // Move back to the original parent element
      parentEl.appendChild(el);
      style = null;
    }
  }

  onMount(() => {
    parentEl = el.parentElement;
  });
</script>

<fullwindow bind:this={el} {style} on:click={onClick}>
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
