<script lang="ts">
  import { onMount } from "svelte";
  import { World } from "hecs";
  import ThreePlugin from "hecs-plugin-three";

  import RapierPlugin from "./ecs/plugins/rapier";
  import Css3DPlugin from "./ecs/plugins/css3d";
  import ComposablePlugin, {
    ComposableTransform,
  } from "./ecs/plugins/composable";

  import { CenteredMesh } from "./ecs/components/CenteredMesh";
  import { CenteredMeshSystem } from "./ecs/systems/CenteredMeshSystem";

  import KeyListener from "./KeyListener.svelte";
  import { start } from "./world";

  let container;
  let gameLoop;

  function initWorld(container = document.body) {
    const world = new World({
      plugins: [ThreePlugin, RapierPlugin, ComposablePlugin, Css3DPlugin],
      components: [CenteredMesh],
      systems: [CenteredMeshSystem],
    });

    world.physics.Transform = ComposableTransform;
    world.cssPresentation.setViewport(container);
    world.cssPresentation.renderer.domElement.style.zIndex = 1;
    world.presentation.setViewport(container);
    world.presentation.renderer.domElement.style.zIndex = 1;
    world.presentation.renderer.domElement.style.position = "absolute";
    world.presentation.renderer.domElement.style.pointerEvents = "none";

    return world;
  }

  onMount(() => {
    const world = initWorld(container);
    gameLoop = start(world);
  });
</script>

<style>
  container {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>

<container bind:this={container} />
<KeyListener {gameLoop} />
