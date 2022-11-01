import { createPlugin } from "~/ecs/base";
import CorePlugin from "~/ecs/plugins/core";
import PhysicsPlugin from "~/ecs/plugins/physics";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

/**
 * Provides a way to mark an area as belonging to a separate 'audio zone' or breakout room.
 */
export default createPlugin({
  name: "audiozone",
  plugins: [CorePlugin, PhysicsPlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
});
