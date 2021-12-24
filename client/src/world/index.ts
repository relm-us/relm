import { derived } from "svelte/store";

import { ecsWorld } from "~/stores/ecsWorld";
import { viewport } from "~/stores/viewport";
import { WorldManager } from "./WorldManager";

export const worldManager = new WorldManager();

// For debugging in JS console
(window as any).relm = worldManager;

// Start worldManager when ecsWorld loads
ecsWorld.subscribe(($ecsWorld) => {
  if ($ecsWorld) worldManager.init({ world: $ecsWorld });
});

// Initialize the worldManager when world & viewport are ready
derived(
  [ecsWorld, viewport],
  ([$ecsWorld, $viewport], set) => {
    set({
      $ecsWorld,
      $viewport,
    });
  },
  { $ecsWorld: null, $viewport: null }
).subscribe(({ $ecsWorld, $viewport }) => {
  if ($ecsWorld && $viewport) {
    // CSS3D elements go "behind" the WebGL canvas
    $ecsWorld.cssPresentation.setViewport($viewport);
    $ecsWorld.cssPresentation.renderer.domElement.style.zIndex = "0";

    // WebGL canvas goes "on top" of CSS3D HTML elements
    $ecsWorld.presentation.setViewport($viewport);
    $ecsWorld.presentation.renderer.domElement.style.zIndex = "1";

    // HTML2D elements go "above" the WebGL canvas
    $ecsWorld.htmlPresentation.setViewport($viewport);
    $ecsWorld.htmlPresentation.domElement.style.zIndex = "2";
  }
});
