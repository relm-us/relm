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
  LinearToneMapping,
  LinearEncoding,
} from "three";

import { World } from "~/ecs/base";

import CorePlugin from "~/ecs/plugins/core";
import ShapePlugin from "~/ecs/plugins/shape";
import WallPlugin from "~/ecs/plugins/wall";
import PerspectivePlugin from "~/ecs/plugins/perspective";

import AnimationPlugin from "~/ecs/plugins/animation";
import AssetPlugin from "~/ecs/plugins/asset";
import BoundingHelperPlugin from "~/ecs/plugins/bounding-helper";
import ColorationPlugin from "~/ecs/plugins/coloration";
import Css3DPlugin from "~/ecs/plugins/css3d";
import DiamondPlugin from "~/ecs/plugins/diamond";
import DistancePlugin from "~/ecs/plugins/distance";
import FirePlugin from "~/ecs/plugins/fire";
import FollowPlugin from "~/ecs/plugins/follow";
import Html2dPlugin from "~/ecs/plugins/html2d";
import ImagePlugin from "~/ecs/plugins/image";
import LightingPlugin from "~/ecs/plugins/lighting";
import LineHelperPlugin from "~/ecs/plugins/line-helper";
import LookAtPlugin from "~/ecs/plugins/look-at";
import ModelPlugin from "~/ecs/plugins/model";
import MorphPlugin from "~/ecs/plugins/morph";
import NonInteractivePlugin from "~/ecs/plugins/non-interactive";
import OutlinePlugin from "~/ecs/plugins/outline";
import ParticlesPlugin from "~/ecs/plugins/particles";
import PlayerControlPlugin from "~/ecs/plugins/player-control";
import PointerPositionPlugin from "~/ecs/plugins/pointer-position";
import PortalPlugin from "~/ecs/plugins/portal";
import PhysicsPlugin from "~/ecs/plugins/physics";
import SkyboxPlugin from "~/ecs/plugins/skybox";
import TransformEffectsPlugin from "~/ecs/plugins/transform-effects";
import TranslucentPlugin from "~/ecs/plugins/translucent";
import TwistBonePlugin from "~/ecs/plugins/twist-bone";

import { PerformanceStatsSystem } from "~/ecs/systems/PerformanceStatsSystem";

import { shadowMapConfig } from "~/config/constants";

export function createRenderer() {
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    stencil: false,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(0x000000, 1.0);
  renderer.toneMapping = LinearToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = false;
  renderer.outputEncoding = LinearEncoding;
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

export function createWorld(rapier) {
  const world = new World({
    getTime: performance.now.bind(performance),
    plugins: [
      CorePlugin({
        renderer: createRenderer(),
        scene: createScene(),
        camera: new PerspectiveCamera(35, 1, 0.1, 1000),
      }),
      PhysicsPlugin({
        // Pass the physics engine in to the plugin
        rapier,
      }),
      ShapePlugin,
      WallPlugin,
      FirePlugin,
      PerspectivePlugin,
      /* others */
      AnimationPlugin,
      AssetPlugin,
      BoundingHelperPlugin,
      ColorationPlugin,
      Css3DPlugin,
      DiamondPlugin,
      DistancePlugin,
      FollowPlugin,
      Html2dPlugin,
      ImagePlugin,
      LightingPlugin,
      LineHelperPlugin,
      LookAtPlugin,
      ModelPlugin,
      MorphPlugin,
      NonInteractivePlugin,
      OutlinePlugin,
      ParticlesPlugin,
      PlayerControlPlugin,
      PointerPositionPlugin,
      PortalPlugin,
      SkyboxPlugin,
      TransformEffectsPlugin,
      TranslucentPlugin,
      TwistBonePlugin,
    ],
    systems: [PerformanceStatsSystem],
  });
  return world;
}
