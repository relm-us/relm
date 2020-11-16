import { createPlugin } from "hecs";
import ThreePlugin from "hecs-plugin-three";

import { CssPresentation } from "./CssPresentation";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

export default createPlugin({
  name: "css3d",
  plugins: [ThreePlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
  decorate(world) {
    if (!world.presentation) {
      throw new Error("css3d plugin reguires hecs-plugin-three");
    }
    world.cssPresentation = new CssPresentation(world);
  },
});
