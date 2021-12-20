import { createPlugin } from "~/ecs/base";
import CorePlugin from "~/ecs/plugins/core";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

/**
 * Show a bounding box or bounding sphere around an object.
 * Used mostly for build mode (currently when holding "shift" key).
 */
export default createPlugin({
  name: "bounding-helper",
  plugins: [CorePlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
});
