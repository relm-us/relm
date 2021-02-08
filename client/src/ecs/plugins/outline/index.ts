import { createPlugin } from "~/ecs/base";
import ThreePlugin from "~/ecs/plugins/three";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

export default createPlugin({
  name: "outline",
  plugins: [ThreePlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
});
