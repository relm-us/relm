import { createPlugin } from "~/ecs/base";

export * from "./types";
export * from "./components";

import * as Components from "./components";
import * as Systems from "./systems";

export { Asset } from "./Asset";

export default createPlugin({
  name: "core",
  systems: Object.values(Systems),
  components: Object.values(Components),
});
