import { createPlugin, World } from "~/ecs/base";

import * as Components from "./components";
import * as Systems from "./systems";

import { Presentation } from "./Presentation";
import { IS_BROWSER } from "./utils";

export { Asset } from "./Asset";

export * from "./types";
export * from "./components";

export { Components };

export default function ConfigurablePlugin(options?) {
  return createPlugin({
    name: "core",
    systems: Object.values(Systems) as any,
    components: Object.values(Components),
    decorate(world: World) {
      if (IS_BROWSER) {
        (world as any).presentation = new Presentation(world, options || {});
      }
    },
  });
}
