import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld"

import { createPlugin } from "~/ecs/base"
import CorePlugin from "~/ecs/plugins/core"
import PerspectivePlugin from "~/ecs/plugins/perspective"

import { HtmlPresentation } from "./HtmlPresentation"

import * as Components from "./components"
import * as Systems from "./systems"

export * from "./components"

export { Components }

export default createPlugin({
  name: "html2d",
  plugins: [CorePlugin, PerspectivePlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
  decorate(world: DecoratedECSWorld) {
    world.htmlPresentation = new HtmlPresentation(world)
  },
})
