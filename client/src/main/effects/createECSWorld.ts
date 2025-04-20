import { OrthographicCamera, PerspectiveCamera } from "three"

import { World } from "~/ecs/base"

import { createRenderer } from "../../world/createRenderer"
import { createScene } from "../../world/createScene"

import CorePlugin from "~/ecs/plugins/core"
import WallPlugin from "~/ecs/plugins/wall"
import PerspectivePlugin from "~/ecs/plugins/perspective"

import AnimationPlugin from "~/ecs/plugins/animation"
import AssetPlugin from "~/ecs/plugins/asset"
import AudioZonePlugin from "~/ecs/plugins/audiozone"
import BloomPlugin from "~/ecs/plugins/bloom"
import BoneAttachPlugin from "~/ecs/plugins/bone-attach"
import BoneTwistPlugin from "~/ecs/plugins/bone-twist"
import CameraPlugin from "~/ecs/plugins/camera"
import ChildAttachPlugin from "~/ecs/plugins/child-attach"
import ClickablePlugin from "~/ecs/plugins/clickable"
import ColliderPlugin from "~/ecs/plugins/collider"
import ColliderVisiblePlugin from "~/ecs/plugins/collider-visible"
import ColorationPlugin from "~/ecs/plugins/coloration"
import ConversationPlugin from "~/ecs/plugins/conversation"
import Css3DPlugin from "~/ecs/plugins/css3d"
import DiamondPlugin from "~/ecs/plugins/diamond"
import DistancePlugin from "~/ecs/plugins/distance"
import FirePlugin from "~/ecs/plugins/fire"
import FollowPlugin from "~/ecs/plugins/follow"
import Html2dPlugin from "~/ecs/plugins/html2d"
import ImagePlugin from "~/ecs/plugins/image"
import InteractorPlugin from "~/ecs/plugins/interactor"
import ItemPlugin from "~/ecs/plugins/item"
import LightingPlugin from "~/ecs/plugins/lighting"
import LineHelperPlugin from "~/ecs/plugins/line-helper"
import LookAtPlugin from "~/ecs/plugins/look-at"
import ModelPlugin from "~/ecs/plugins/model"
import MorphPlugin from "~/ecs/plugins/morph"
import NonInteractivePlugin from "~/ecs/plugins/non-interactive"
import OutlinePlugin from "~/ecs/plugins/outline"
import ParticlesPlugin from "~/ecs/plugins/particles"
import PlayerControlPlugin from "~/ecs/plugins/player-control"
import PointerPositionPlugin from "~/ecs/plugins/pointer-position"
import PortalPlugin from "~/ecs/plugins/portal"
import PhysicsPlugin from "~/ecs/plugins/physics"
import ShapePlugin from "~/ecs/plugins/shape"
import SkyboxPlugin from "~/ecs/plugins/skybox"
import SpinPlugin from "~/ecs/plugins/spin"
import SoundEffectPlugin from "~/ecs/plugins/sound-effect"
import TransformControlsPlugin from "~/ecs/plugins/transform-controls"
import TransitionPlugin from "~/ecs/plugins/transition"
import TranslucentPlugin from "~/ecs/plugins/translucent"

import { PerformanceStatsSystem } from "~/ecs/systems/PerformanceStatsSystem"
import type { Dispatch } from "../ProgramTypes"
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld"
import { registerComponentMigrations } from "./registerComponentMigrations"

const ortho = localStorage.getItem("ortho") ? JSON.parse(localStorage.getItem("ortho")) : null

export const createECSWorld = (rapier) => (dispatch: Dispatch) => {
  const ecsWorld = new World({
    getTime: performance.now.bind(performance),
    plugins: [
      CorePlugin({
        renderer: createRenderer(),
        scene: createScene(),
        camera: ortho
          ? new OrthographicCamera(-ortho.width / 2, ortho.width / 2, ortho.height / 2, -ortho.height / 2, 0.1, 200)
          : new PerspectiveCamera(35, 1, 0.1, 200),
      }),
      PhysicsPlugin({
        // Pass the physics engine in to the plugin
        rapier,
      }),
      WallPlugin,
      /* others */
      AnimationPlugin,
      AssetPlugin,
      AudioZonePlugin,
      BloomPlugin,
      BoneAttachPlugin,
      BoneTwistPlugin,
      CameraPlugin,
      ChildAttachPlugin,
      ClickablePlugin,
      ColliderPlugin,
      ColliderVisiblePlugin,
      ColorationPlugin,
      ConversationPlugin,
      Css3DPlugin,
      DiamondPlugin,
      DistancePlugin,
      FirePlugin,
      FollowPlugin,
      Html2dPlugin,
      ImagePlugin,
      InteractorPlugin,
      ItemPlugin,
      LightingPlugin,
      LineHelperPlugin,
      LookAtPlugin,
      ModelPlugin,
      MorphPlugin,
      NonInteractivePlugin,
      OutlinePlugin,
      ParticlesPlugin,
      PerspectivePlugin,
      PlayerControlPlugin,
      PointerPositionPlugin,
      PortalPlugin,
      ShapePlugin,
      SkyboxPlugin,
      SpinPlugin,
      SoundEffectPlugin,
      TransformControlsPlugin,
      TransitionPlugin,
      TranslucentPlugin,
    ],
    systems: [PerformanceStatsSystem],
  }) as DecoratedECSWorld

  registerComponentMigrations(ecsWorld)

  const interval = setInterval(() => {
    ecsWorld.update(1 / 40)
  }, 40)
  const unsub = () => clearInterval(interval)

  dispatch({ id: "createdECSWorld", ecsWorld, ecsWorldLoaderUnsub: unsub })
}
