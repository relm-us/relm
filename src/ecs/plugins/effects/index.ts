import { createPlugin } from "hecs";
import ThreePlugin from "hecs-plugin-three";

import { Effects } from "./Effects";
import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

export default createPlugin({
  name: "hecs-plugin-effects",
  plugins: [ThreePlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
  decorate(world, options) {
    world.effects = new Effects(world, options);
  },
});
