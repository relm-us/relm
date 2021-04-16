import { createPlugin, World } from "~/ecs/base";
import { DecoratedWorld } from "~/types/DecoratedWorld";

import * as Components from "./components";
import * as Systems from "./systems";

import { Presentation } from "./Presentation";
import { IS_BROWSER } from "./utils";

export { Asset } from "./Asset";

export * from "./types";
export * from "./components";

export { Components, Presentation };

export default function ConfigurablePlugin(options?) {
  return createPlugin({
    name: "core",
    systems: Object.values(Systems) as any,
    components: Object.values(Components),
    decorate(world: DecoratedWorld) {
      if (IS_BROWSER) {
        world.presentation = new Presentation(world, options || {});
      }
    },
  });
}
