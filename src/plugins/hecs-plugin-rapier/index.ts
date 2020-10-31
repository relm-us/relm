import { createPlugin } from "hecs";
import CorePlugin from "hecs-plugin-core";

import { Physics } from "./Physics";
import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

export default createPlugin({
  name: "hecs-plugin-rapier",
  plugins: [CorePlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
  decorate(world) {
    if (!RAPIER) {
      throw new Error(
        'hecs-plugin-rapier: Rapier3d should be loaded and available globally under "RAPIER"'
      );
    }
    world.physics = new Physics(world);
  },
});
