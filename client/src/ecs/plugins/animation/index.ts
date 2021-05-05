import { createPlugin } from "~/ecs/base";
import CorePlugin from "~/ecs/plugins/core";
import ModelPlugin from "~/ecs/plugins/model";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

export default createPlugin({
  name: "animation",
  plugins: [CorePlugin, ModelPlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
});
