import { createPlugin } from "~/ecs/base"
import CorePlugin from "~/ecs/plugins/core"
import PhysicsPlugin from "~/ecs/plugins/physics"

import * as Components from "./components"
import * as Systems from "./systems"

export * from "./components"

export { Components }

export default function ConfigurablePlugin(options) {
  return createPlugin({
    name: "collider",
    plugins: [CorePlugin, PhysicsPlugin],
    systems: Object.values(Systems),
    components: Object.values(Components),
  })
}
