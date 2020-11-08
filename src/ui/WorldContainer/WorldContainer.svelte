<script lang="ts">
  import { onMount } from "svelte";

  import {
    addDemonstrationEntities,
    removeDemonstrationEntities,
  } from "~/world/demo";

  import { mountWorld } from "~/world/creation";

  export let world: any;

  let container;

  let previousTime = 0;
  const gameLoop = (time) => {
    const delta = time - previousTime;
    world.update(delta);
    previousTime = time;
  };

  onMount(() => {
    mountWorld(world, container);
    addDemonstrationEntities(world);
    world.presentation.setLoop(gameLoop);
    return () => {
      world.presentation.setLoop(null);
      removeDemonstrationEntities();
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

<container bind:this={container}>
  <!-- The CSS3DRenderer container goes here -->
  <!-- The WebGLRenderer canvas goes here -->
</container>
