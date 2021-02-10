import { readable, derived, Readable } from "svelte/store";

import { World } from "~/ecs/base";

import { createWorld } from "../world/creation";

const rapier = readable(null, (set) => {
  import("@dimforge/rapier3d")
    .then((rapier) => {
      set(rapier);
    })
    .catch((error) => {
      console.error("Can't load physics engine rapier3d", error.message);
    });
});

export const world: Readable<World> = derived(
  rapier,
  ($rapier, set) => {
    if (!$rapier) return;
    const world = createWorld($rapier);
    set(world);
  },
  null
);

// export const world: Readable<World | null> = readable(null, (set) => {
//   import("@dimforge/rapier3d")
//     .then((rapier) => {
//       const world = createWorld(rapier);

//       set(world);
//     })
//     .catch((error) => {
//       console.error("Can't load physics engine rapier3d", error.message);
//     });
// });
