<script lang="ts">
  import { onMount } from "svelte";

  import KeyListener from "~/KeyListener.svelte";
  import { start } from "./world";

  import { mountWorld } from "../../world/creation";

  export let world: any;

  let container;
  let gameLoop;

  onMount(() => {
    mountWorld(world, container);
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
</style>

<container bind:this={container}>
  <!-- The CSS3DRenderer container goes here -->
  <!-- The WebGLRenderer canvas goes here -->
</container>

<KeyListener {gameLoop} />
