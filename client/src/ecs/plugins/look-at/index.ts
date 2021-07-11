import { createPlugin } from "~/ecs/base";
import CorePlugin from "~/ecs/plugins/core";
import FollowPlugin from "~/ecs/plugins/follow";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

export default createPlugin({
  name: "look-at",
  plugins: [CorePlugin, FollowPlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
});
