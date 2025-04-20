import { createPlugin } from "~/ecs/base"
import CorePlugin from "~/ecs/plugins/core"

import * as Components from "./components"
import * as Systems from "./systems"

export * from "./components"

export { Components }

/**
 * Identifies an entity as clickable in play-mode. What happens when the
 * participant clicks it is determined by the Clickable component's
 * parameters.
 */
export default createPlugin({
  name: "clickable",
  plugins: [CorePlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
})
