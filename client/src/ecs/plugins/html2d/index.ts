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
  decorate(world) {
    if (!(world as any).presentation) {
      throw new Error("html2d plugin reguires plugins/core");
    }
    (world as any).htmlPresentation = new HtmlPresentation(world);
  },
});
