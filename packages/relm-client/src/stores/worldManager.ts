import { derived } from "svelte/store";

import { world } from "./world";
import { viewport } from "./viewport";
import { connection } from "./connection";

import WorldManager from "~/world/WorldManager";

export const worldManager = derived(
  [world, viewport, connection],
  ([$world, $viewport, $connection], set) => {
    if ($world && $viewport) {
      const manager = new WorldManager({
        world: $world,
        viewport: $viewport,
      });

      // Make debugging easier
      (window as any).relm = manager;

      if ($connection) {
        // Initial connect
        manager.connect($connection);
      }

      set(manager);
      return () => manager.reset();
    } else {
      set(null);
    }
  },
  null
);
