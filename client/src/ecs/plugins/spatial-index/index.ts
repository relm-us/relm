import { createPlugin } from "~/ecs/base";
import CorePlugin from "~/ecs/plugins/core";
import BoundingBoxPlugin from "~/ecs/plugins/bounding-box";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

export default createPlugin({
  name: "spatial-index",
  plugins: [CorePlugin, BoundingBoxPlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
});
