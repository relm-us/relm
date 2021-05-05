import { createPlugin, Entity } from "~/ecs/base";
import CorePlugin, { Object3D } from "~/ecs/plugins/core";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

export default createPlugin({
  name: "model",
  plugins: [CorePlugin],
  systems: Object.values(Systems) as any,
  components: Object.values(Components),
});
