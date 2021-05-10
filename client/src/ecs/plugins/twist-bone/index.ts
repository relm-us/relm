import { createPlugin } from "~/ecs/base";
import CorePlugin from "~/ecs/plugins/core";
import ModelPlugin from "~/ecs/plugins/model";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };
export { headFollowsPointer, headFollowsAngle } from "./headFollows";

export default createPlugin({
  name: "twist-bone",
  plugins: [CorePlugin, ModelPlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
});
