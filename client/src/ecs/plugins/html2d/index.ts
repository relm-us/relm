import { DecoratedWorld } from "~/types/DecoratedWorld";

import { createPlugin } from "~/ecs/base";
import CorePlugin from "~/ecs/plugins/core";

import { HtmlPresentation } from "./HtmlPresentation";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };

export default createPlugin({
  name: "html2d",
  plugins: [CorePlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
  decorate(world: DecoratedWorld) {
    world.htmlPresentation = new HtmlPresentation(world);
  },
});
