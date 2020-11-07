<script lang="ts">
  import { onMount } from "svelte";
  import {
    WebGLRenderer,
    Scene,
    Color,
    HemisphereLight,
    DirectionalLight,
    sRGBEncoding,
    VSMShadowMap,
    PCFSoftShadowMap,
    PCFShadowMap,
  } from "three";
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
  let glCanvas;

  function createRenderer() {
    const xyz = 1;
    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: glCanvas,
    });
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = VSMShadowMap;
    // renderer.shadowMap.type = PCFSoftShadowMap;

    return renderer;
  }

  function createScene() {
    const scene = new Scene();
    scene.background = new Color(0xaec7ed);
    scene.name = "scene";

    const hemiLight = new HemisphereLight(0x333333, 0xffffff);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new DirectionalLight(0x888888, 6);
    dirLight.position.set(-4, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.camera.top = 5;
    dirLight.shadow.camera.bottom = -5;
    dirLight.shadow.camera.left = -5;
    dirLight.shadow.camera.right = 5;
    dirLight.shadow.camera.near = 20;
    dirLight.shadow.camera.far = 40;
    dirLight.shadow.radius = 1;
    // dirLight.shadow.bias = 0.0004;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    return scene;
  }

  function initWorld(container = document.body) {
    const world = new World({
      plugins: [
        [
          ThreePlugin,
          {
            renderer: createRenderer(),
            scene: createScene(),
          },
        ],
        RapierPlugin,
        ComposablePlugin,
        Css3DPlugin,
      ],
      components: [CenteredMesh],
      systems: [CenteredMeshSystem],
    });

    // Let the Rapier3d physics plugin know to use ComposableTransform instead of default Transform
    world.physics.Transform = ComposableTransform;

    world.cssPresentation.setViewport(container);
    world.cssPresentation.renderer.domElement.style.zIndex = 1;

    world.presentation.setViewport(container);

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

<container bind:this={container}><canvas bind:this={glCanvas} /></container>
<KeyListener {gameLoop} />
