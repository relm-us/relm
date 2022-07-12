import { createPlugin } from "~/ecs/base";
import CorePlugin from "~/ecs/plugins/core";
import OutlinePlugin from "~/ecs/plugins/outline";
import ClickablePlugin from "~/ecs/plugins/clickable";
import PhysicsPlugin from "~/ecs/plugins/physics";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";
export * from "./systems";

export { Components };

export default createPlugin({
  name: "interactor",
  plugins: [CorePlugin, OutlinePlugin, ClickablePlugin, PhysicsPlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
});
