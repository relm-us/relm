import {
  WebGLRenderer,
  Scene,
  Color,
  HemisphereLight,
  DirectionalLight,
  sRGBEncoding,
  VSMShadowMap,
  PCFShadowMap,
  BasicShadowMap,
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
import { PotentiallyControllable } from "~/ecs/components/PotentiallyControllable";
import { ThrustControllerSystem } from "~/ecs/systems/ThrustControllerSystem";
import { TransferControlSystem } from "~/ecs/systems/TransferControlSystem";

import { GatherStatsSystem } from "~/ecs/systems/GatherStatsSystem";

type ShadowMapConfig = "BASIC" | "PCF" | "VSM";
const shadowMapConfig: ShadowMapConfig = "VSM";

export function createRenderer() {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    stencil: false,
    powerPreference: "high-performance",
  });

  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = true;
  switch (shadowMapConfig) {
    case "BASIC":
      renderer.shadowMap.type = BasicShadowMap;
      break;
    case "PCF":
      renderer.shadowMap.type = PCFShadowMap;
      break;
    case "VSM":
      renderer.shadowMap.type = VSMShadowMap;
      break;
  }

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

  const size = 10;
  const dirLight = new DirectionalLight(0xffffff, 4);
  dirLight.position.set(-4, 20, 10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.camera.top = size;
  dirLight.shadow.camera.bottom = -size;
  dirLight.shadow.camera.left = -size;
  dirLight.shadow.camera.right = size;
  dirLight.shadow.camera.near = 2;
  dirLight.shadow.camera.far = 40;
  dirLight.shadow.radius = 2;
  switch (shadowMapConfig) {
    case "BASIC":
    case "PCF":
      break;
    case "VSM":
      dirLight.shadow.bias = -0.001;
      break;
  }
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
          // postprocess: true,
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
    components: [CenteredMesh, ThrustController, PotentiallyControllable],
    systems: [
      CenteredMeshSystem,
      ThrustControllerSystem,
      TransferControlSystem,
      GatherStatsSystem,
    ],
  });
  return world;
}
