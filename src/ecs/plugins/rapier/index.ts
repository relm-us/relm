import { createPlugin } from "hecs";
import CorePlugin, { Transform } from "hecs-plugin-core";

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
  decorate(world, options) {
    const rapier = options.rapier || RAPIER;
    if (!rapier) {
      throw new Error("hecs-plugin-rapier: Rapier engine not found");
    }
    world.physics = new Physics(world, rapier, options.transform || Transform);
  },
});
