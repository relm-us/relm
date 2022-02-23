import { createPlugin } from "~/ecs/base";
import CorePlugin from "~/ecs/plugins/core";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

/**
 * Calculate a bounding box around an object, and optionally show
 * the bounding box.
 */
export default createPlugin({
  name: "bounding-box",
  plugins: [CorePlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
});
