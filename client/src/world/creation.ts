import {
  WebGLRenderer,
  OrthographicCamera,
  Scene,
  Fog,
  FogExp2,
  Color,
  AmbientLight,
  HemisphereLight,
  VSMShadowMap,
  PCFShadowMap,
  BasicShadowMap,
  PerspectiveCamera,
} from "three";

import { World } from "~/ecs/base";

import CorePlugin from "~/ecs/plugins/core";
import ShapePlugin from "~/ecs/plugins/shape";
import WallPlugin from "~/ecs/plugins/wall";
import ImagePlugin from "~/ecs/plugins/image";

import Css3DPlugin from "~/ecs/plugins/css3d";
import FirePlugin from "~/ecs/plugins/fire";
import FollowPlugin from "~/ecs/plugins/follow";
import Html2dPlugin from "~/ecs/plugins/html2d";
import LightingPlugin from "~/ecs/plugins/lighting";
import NormalizePlugin from "~/ecs/plugins/normalize";
import OutlinePlugin from "~/ecs/plugins/outline";
import PlayerControlPlugin from "~/ecs/plugins/player-control";
import PointerPlanePlugin from "~/ecs/plugins/pointer-plane";
import PortalPlugin from "~/ecs/plugins/portal";
import RapierPlugin from "~/ecs/plugins/rapier";
import SkyboxPlugin from "~/ecs/plugins/skybox";
import TransformEffectsPlugin from "~/ecs/plugins/transform-effects";

import { InvisibleToMouse } from "~/ecs/components/InvisibleToMouse";

import { PerformanceStatsSystem } from "~/ecs/systems/PerformanceStatsSystem";
import { InvisibleToMouseSystem } from "~/ecs/systems/InvisibleToMouseSystem";

import { shadowMapConfig } from "~/stores/config";

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

  // scene.fog = new FogExp2(0xe5e0dd, 0.022);

  // const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 2);
  // scene.add(hemiLight);

  const ambientLight = new AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

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
    getTime: performance.now.bind(performance),
    plugins: [
      CorePlugin({
        renderer: createRenderer(),
        scene: createScene(),
        camera: createCamera(false),
      }),
      RapierPlugin({
        // Pass the physics engine in to the plugin
        rapier,
      }),
      ShapePlugin,
      WallPlugin,
      FirePlugin,
      ImagePlugin,
      Css3DPlugin,
      FollowPlugin,
      Html2dPlugin,
      LightingPlugin,
      NormalizePlugin,
      OutlinePlugin,
      PlayerControlPlugin,
      PointerPlanePlugin,
      PortalPlugin,
      SkyboxPlugin,
      TransformEffectsPlugin,
    ],
    components: [InvisibleToMouse],
    systems: [PerformanceStatsSystem, InvisibleToMouseSystem],
  });
  return world;
}
