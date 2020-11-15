import {
  WebGLRenderer,
  OrthographicCamera,
  Scene,
  Color,
  HemisphereLight,
  VSMShadowMap,
  PCFShadowMap,
  BasicShadowMap,
  PerspectiveCamera,
} from "three";

import { World } from "hecs";

import ComposablePlugin, {
  ComposableTransform,
} from "~/ecs/plugins/composable";
import Css3DPlugin from "~/ecs/plugins/css3d";
import FollowPlugin from "~/ecs/plugins/follow";
import LightingPlugin from "~/ecs/plugins/lighting";
import NormalizePlugin from "~/ecs/plugins/normalize";
import OutlinePlugin from "~/ecs/plugins/outline";
import RapierPlugin from "~/ecs/plugins/rapier";
import ThreePlugin from "hecs-plugin-three";

import { ThrustController, PotentiallyControllable } from "~/ecs/components";
import { ThrustControllerSystem } from "~/ecs/systems/ThrustControllerSystem";
import { TransferControlSystem } from "~/ecs/systems/TransferControlSystem";

import { GatherStatsSystem } from "~/ecs/systems/GatherStatsSystem";

import { shadowMapConfig } from "./config";

export function createRenderer() {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    stencil: false,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(0x000000, 1.0);
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

  return scene;
}

export function createCamera(ortho = true) {
  if (ortho) {
    return new OrthographicCamera(-15, 15, 15, -15, 0.1, 1000);
  } else {
    return new PerspectiveCamera(35, 1, 0.1, 1000);
  }
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
          camera: createCamera(false),
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
      Css3DPlugin,
      FollowPlugin,
      LightingPlugin,
      NormalizePlugin,
      OutlinePlugin,
    ],
    components: [ThrustController, PotentiallyControllable],
    systems: [ThrustControllerSystem, TransferControlSystem, GatherStatsSystem],
  });
  return world;
}
