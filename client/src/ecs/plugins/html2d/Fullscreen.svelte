<script>
  import { onMount, createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let el;

  onMount(async () => {
    el.addEventListener("fullscreenchange", (event) => {
      if (!document.fullscreenElement) {
        // exited full screen
        dispatch("close");
      }
    });
    
    try {
      await el.requestFullscreen();
    } catch (err) {
      dispatch("close", err);
    }
  });

  //Document.exitFullscreen()
</script>

<fullscreen bind:this={el}>
  <slot />
</fullscreen>

<style>
  fullscreen {
    display: block;
  }
</style>
