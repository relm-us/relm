import { createPlugin } from "~/ecs/base";
import ThreePlugin from "~/ecs/plugins/three";

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
    if (!(world as any).presentation) {
      throw new Error("css3d plugin reguires plugin/three");
    }
    (world as any).cssPresentation = new CssPresentation(world);
  },
});
