import { readable, Readable } from "svelte/store";

import { World } from "~/types/hecs/world";

import { createWorld } from "./creation";

export const store: Readable<World | null> = readable(null, (set) => {
  import("@dimforge/rapier3d")
    .then((rapier) => {
      const world = createWorld(rapier);
      set(world);
    })
    .catch((error) => {
      console.error("Can't load physics engine rapier3d", error.message);
    });
});
