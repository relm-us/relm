import { createPlugin } from "~/ecs/base";
import CorePlugin from "~/ecs/plugins/core";
import PointerPositionPlugin from "~/ecs/plugins/pointer-position";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

export default createPlugin({
  name: "player-control",
  plugins: [CorePlugin, PointerPositionPlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
});
