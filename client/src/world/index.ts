import { WorldManager } from "./WorldManager";

export const worldManager = new WorldManager();

// For debugging in JS console
(window as any).relm = worldManager;

// Start worldManager when ecsWorld loads
// ecsWorld.subscribe(($ecsWorld) => {
//   if ($ecsWorld) {
//     worldDoc.set(new WorldDoc($ecsWorld));
//     worldManager.init({ world: $ecsWorld });
//   }
// });
