import { derived } from "svelte/store";

import { world } from "./world";
import { viewport } from "./viewport";

import { connection } from "~/world/config";
import WorldManager from "~/world/WorldManager";

export const worldManager = derived(
  [world, viewport],
  ([$world, $viewport], set) => {
    if ($world && $viewport) {
      const manager = new WorldManager({
        world: $world,
        connection,
        viewport: $viewport,
      });

      // Make debugging eaiser
      (window as any).relm = manager;

      set(manager);
      return () => {
        manager.reset();
      };
    } else {
      set(null);
    }
  },
  null
);
