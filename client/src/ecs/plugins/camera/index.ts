import { createPlugin } from "~/ecs/base"
import CorePlugin from "~/ecs/plugins/core"
import PhysicsPlugin from "~/ecs/plugins/physics"

import * as Components from "./components"
import * as Systems from "./systems"

export * from "./components"
export * from "./systems"

export { Components }

export default function ConfigurablePlugin(options?) {
  return createPlugin({
    name: "camera",
    plugins: [CorePlugin, PhysicsPlugin],
    systems: Object.values(Systems) as any,
    components: Object.values(Components),
  })
}
