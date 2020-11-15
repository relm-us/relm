import {
  WebGLRenderer,
  OrthographicCamera,
  Scene,
  Color,
  HemisphereLight,
  DirectionalLight,
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

  // const size = 10;
  // const dirLight = new DirectionalLight(0xffffff, 4);
  // (window as any).dirLight = dirLight;
  // dirLight.position.set(-4, 20, 10);
  // dirLight.castShadow = true;
  // dirLight.shadow.mapSize.height = 1024;
  // dirLight.shadow.mapSize.width = 1024;
  // dirLight.shadow.camera.top = size;
  // dirLight.shadow.camera.bottom = -size;
  // dirLight.shadow.camera.left = -size;
  // dirLight.shadow.camera.right = size;
  // dirLight.shadow.camera.near = 2;
  // dirLight.shadow.camera.far = 40;
  // dirLight.shadow.radius = 2;
  // switch (shadowMapConfig) {
  //   case "BASIC":
  //   case "PCF":
  //     break;
  //   case "VSM":
  //     dirLight.shadow.bias = -0.001;
  //     break;
  // }
  // scene.add(dirLight);
  // scene.add(dirLight.target);

  // // temp hack: move light with camera
  // setInterval(() => {
  //   // const camera = (window as any).camera;
  //   // if (!camera) return;
  //   // const object
  //   // dirLight.position.x = camera.position.x - 4;
  //   // dirLight.position.y = camera.position.y + 20;
  //   // dirLight.position.z = camera.position.z + 10;
  //   console.log("happening");
  //   dirLight.position.x += 0.01;
  //   dirLight.target.position.x += 0.01;
  //   // dirLight.matrixWorldNeedsUpdate = true;
  // }, 34);

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
