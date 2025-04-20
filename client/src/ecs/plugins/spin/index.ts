import { createPlugin } from "~/ecs/base"
import CorePlugin from "~/ecs/plugins/core"

import * as Components from "./components"
import * as Systems from "./systems"

export * from "./components"

export { Components }

export default createPlugin({
  name: "spin",
  plugins: [CorePlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
})
