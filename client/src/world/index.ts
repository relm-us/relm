import { derived } from "svelte/store";

import { world } from "~/stores/world";
import { viewport } from "~/stores/viewport";
import { WorldManager } from "./WorldManager";

export const worldManager = new WorldManager();

// For debugging in JS console
(window as any).relm = worldManager;

// Initialize the worldManager when world & viewport are ready
derived(
  [world, viewport],
  ([$world, $viewport], set) => {
    if ($world && $viewport) {
      set({
        world: $world,
        viewport: $viewport,
      });
    } else {
      set(null);
    }
  },
  null
).subscribe((worldAndViewport) => {
  if (worldAndViewport) worldManager.init(worldAndViewport);
});
