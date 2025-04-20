import { createPlugin } from "~/ecs/base"
import CorePlugin from "~/ecs/plugins/core"
import ColliderPlugin from "~/ecs/plugins/collider"
import PhysicsPlugin from "~/ecs/plugins/physics"
import ParticlesPlugin from "~/ecs/plugins/particles"
import AnimationPlugin from "~/ecs/plugins/animation"
import PlayerControlPlugin from "~/ecs/plugins/player-control"

import * as Components from "./components"
import * as Systems from "./systems"

export * from "./components"

export { Components }

export default createPlugin({
  name: "portal",
  plugins: [CorePlugin, ColliderPlugin, PhysicsPlugin, ParticlesPlugin, AnimationPlugin, PlayerControlPlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
})
