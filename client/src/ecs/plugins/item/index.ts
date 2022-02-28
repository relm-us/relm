import { createPlugin } from "~/ecs/base";
import CorePlugin from "~/ecs/plugins/core";
import BoundingBoxPlugin from "~/ecs/plugins/bounding-box";
import OutlinePlugin from "~/ecs/plugins/outline";
import SpatialIndexPlugin from "~/ecs/plugins/spatial-index";
import ClickablePlugin from "~/ecs/plugins/clickable";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

export default createPlugin({
  name: "item",
  plugins: [
    CorePlugin,
    BoundingBoxPlugin,
    OutlinePlugin,
    ClickablePlugin,
    SpatialIndexPlugin,
  ],
  systems: Object.values(Systems),
  components: Object.values(Components),
});
