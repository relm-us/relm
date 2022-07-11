import { createPlugin } from "~/ecs/base";
import CorePlugin from "~/ecs/plugins/core";
import FormPlugin from "~/ecs/plugins/form";

import * as Components from "./components";
import * as Systems from "./systems";

export * from "./components";

export { Components };
export { headFollowsPointer, headFollowsAngle } from "./headFollows";

export default createPlugin({
  name: "bone-twist",
  plugins: [CorePlugin, FormPlugin],
  systems: Object.values(Systems),
  components: Object.values(Components),
});
