import { derived } from "svelte/store";

import { ecsWorld } from "~/stores/ecsWorld";
import { viewport } from "~/stores/viewport";
import { WorldManager } from "./WorldManager";

export const worldManager = new WorldManager();

// For debugging in JS console
(window as any).relm = worldManager;

// Initialize the worldManager when world & viewport are ready
derived(
  [ecsWorld, viewport],
  ([$ecsWorld, $viewport], set) => {
    if ($ecsWorld && $viewport) {
      set({
        world: $ecsWorld,
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
