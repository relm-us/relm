import { createPlugin } from "~/ecs/base"
import CorePlugin from "~/ecs/plugins/core"
import AssetPlugin from "~/ecs/plugins/asset"

import * as Components from "./components"
import * as Systems from "./systems"

export * from "./components"

export { Components }

export default createPlugin({
  name: "image",
  plugins: [CorePlugin, AssetPlugin],
  systems: Object.values(Systems) as any,
  components: Object.values(Components),
})
