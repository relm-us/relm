<script lang="ts">
  import { onMount } from "svelte";

  import KeyListener from "~/KeyListener.svelte";
  import { start } from "./world";

  import { initWorld } from "./creation";

  let container;
  let gameLoop;
  let glCanvas;

  onMount(() => {
    const world = initWorld(container, glCanvas);
    gameLoop = start(world);
  });
</script>

<style>
  container {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
  }
  canvas {
    outline: 0;
    position: absolute;
    pointer-events: none;
    z-index: 1;
  }
</style>

<container bind:this={container}>
  <!-- Create the WebGLRenderer canvas element -->
  <canvas bind:this={glCanvas} />
</container>

<KeyListener {gameLoop} />
