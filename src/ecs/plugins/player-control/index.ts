import { createPlugin } from "hecs";
import ThreePlugin from "hecs-plugin-three";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

export default createPlugin({
  name: "player-control",
  plugins: [ThreePlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
});
