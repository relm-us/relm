<script lang="ts">
  import { onMount } from "svelte";

  import { store } from "~/world/size";
  import { worldManager } from "~/world";

  // HECS world
  export let world: any;

  let viewport;

  const ResizeObserver = (window as any).ResizeObserver;

  const onResize = () => {
    const size = {
      width: viewport?.offsetWidth || 1,
      height: viewport?.offsetHeight || 1,
    };
    store.set(size);
  };

  onMount(() => {
    const observer = new ResizeObserver(onResize.bind(this));
    observer.observe(viewport);

    worldManager.setWorld(world);
    worldManager.setViewport(viewport);
    worldManager.populate();
    worldManager.start();
    return () => {
      observer.unobserve(viewport);

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
