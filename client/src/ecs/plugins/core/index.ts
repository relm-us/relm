import { createPlugin, World } from "~/ecs/base"
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld"

import * as Components from "./components"
import * as Systems from "./systems"

import { Presentation } from "./Presentation"
import { IS_BROWSER } from "./utils"

export { Asset } from "./Asset"

export * from "./types"
export * from "./components"

export { Components, Presentation }

export default function ConfigurablePlugin(options?) {
  return createPlugin({
    name: "core",
    systems: Object.values(Systems) as any,
    components: Object.values(Components),
    decorate(world: DecoratedECSWorld) {
      if (IS_BROWSER) {
        world.presentation = new Presentation(world, options || {})
      }
    },
  })
}
