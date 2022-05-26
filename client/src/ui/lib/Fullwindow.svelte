<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";

  export let zIndex = 100;

  const dispatch = createEventDispatcher();

  let el;

  function onClick(event) {
    if (event.target === el) dispatch("close");
    else dispatch("click");
  }

  onMount(async () => {
    // Move the containing element to document.body so that "fullwindow" mode can
    // escape absolute/relative positioned elements and take up the whole window.
    document.body.appendChild(el);
  });
</script>

<fullwindow bind:this={el} style={`z-index: ${zIndex}`} on:click={onClick}>
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
