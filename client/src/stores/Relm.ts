import { derived, Readable } from "svelte/store";

import { world } from "./world";
import { viewport } from "./viewport";
import { connection } from "./connection";
import { worldState } from './worldState'

import WorldManager from "~/world/WorldManager";

export const Relm: Readable<WorldManager> = derived(
  [world, viewport],
  ([$world, $viewport], set) => {
    if ($world && $viewport) {
      const manager = new WorldManager({
        world: $world,
        viewport: $viewport,
      });
      // Make debugging easier
      (window as any).relm = manager;

      set(manager);
      return () => manager.reset();
    } else {
      set(null);
    }
  },
  null
);

derived([Relm, connection], ([$Relm, $connection], set) => {
  if (!$Relm) return;
  if ($connection.state === "connected") {
    // Initial connect
    $Relm.connect($connection);
  } else if ($connection.state === "error") {
    worldState.set("error");
  }
  return () => $Relm.disconnect();
}).subscribe(() => {});
