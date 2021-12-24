import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

import { createPlugin } from "~/ecs/base";
import CorePlugin from "~/ecs/plugins/core";

import { Perspective } from "./Perspective";
export { Perspective }

import * as Systems from "./systems";

/**
 * Creates the Perspective object on the World, allowing other plugins
 * easy access to what is within view of the camera, in relation to the
 * participant's avatar.
 */
export default createPlugin({
  name: "perspective",
  plugins: [CorePlugin],
  systems: Object.values(Systems),
  decorate(world: DecoratedECSWorld) {
    world.perspective = new Perspective(world.presentation);
  },
});
