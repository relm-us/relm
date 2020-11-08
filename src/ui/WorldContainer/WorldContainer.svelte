<script lang="ts">
  import { onMount } from "svelte";

  import { worldManager } from "~/world";

  // HECS world
  export let world: any;

  let viewport;

  onMount(() => {
    worldManager.setWorld(world);
    worldManager.setViewport(viewport);
    worldManager.populate();
    worldManager.start();
    return () => {
      worldManager.stop();
      worldManager.depopulate();
      worldManager.setViewport(null);
    };
  });
</script>

<style>
  container {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>

<container bind:this={viewport}>
  <!-- The CSS3DRenderer container goes here -->
  <!-- The WebGLRenderer canvas goes here -->
</container>
