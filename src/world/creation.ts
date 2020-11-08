import {
  WebGLRenderer,
  Scene,
  Color,
  HemisphereLight,
  DirectionalLight,
  sRGBEncoding,
  VSMShadowMap,
} from "three";

import { World } from "hecs";
import ThreePlugin from "hecs-plugin-three";

import ComposablePlugin, {
  ComposableTransform,
} from "~/ecs/plugins/composable";
import Css3DPlugin from "~/ecs/plugins/css3d";
import EffectsPlugin from "~/ecs/plugins/effects";
import RapierPlugin from "~/ecs/plugins/rapier";

import { CenteredMesh } from "~/ecs/components/CenteredMesh";
import { CenteredMeshSystem } from "~/ecs/systems/CenteredMeshSystem";

import { ThrustController } from "~/ecs/components/ThrustController";
import { ThrustControllerSystem } from "~/ecs/systems/ThrustControllerSystem";

export function createRenderer() {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
  });

  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = VSMShadowMap;

  const style = renderer.domElement.style;
  style.outline = "0";
  style.position = "absolute";
  style.pointerEvents = "none";
  style.zIndex = "1";

  return renderer;
}

export function createScene() {
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

export function createWorld(rapier) {
  const world = new World({
    plugins: [
      ComposablePlugin,
      [
        ThreePlugin,
        {
          renderer: createRenderer(),
          scene: createScene(),
        },
      ],
      [
        RapierPlugin,
        {
          // Let the Rapier3d physics plugin know to use ComposableTransform
          // instead of default Transform
          transform: ComposableTransform,
          // Pass the physics engine in to the plugin
          rapier,
        },
      ],
      // [EffectsPlugin, {}],

      Css3DPlugin,
    ],
    components: [CenteredMesh, ThrustController],
    systems: [CenteredMeshSystem, ThrustControllerSystem],
  });
  return world;
}
