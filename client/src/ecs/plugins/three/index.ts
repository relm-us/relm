import { createPlugin, World } from "~/ecs/base";
import { SystemClass } from "~/ecs/base/System";
import Core from "~/ecs/plugins/core";

import * as Components from "./components";
import * as Systems from "./systems";

import { Presentation } from "./Presentation";
import { IS_BROWSER } from "./utils";

export * from "./components";

export { Components };

export default function ConfigurablePlugin(options?) {
  return createPlugin({
    name: "three",
    plugins: [Core],
    systems: Object.values(Systems) as any,
    components: Object.values(Components),
    decorate(world: World) {
      if (IS_BROWSER) {
        (world as any).presentation = new Presentation(world, options || {});
      }
    },
  });
}
