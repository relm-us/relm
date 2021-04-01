import { get, writable, derived, Readable, Writable } from "svelte/store";
import { worldState } from "./worldState";
import { World } from "~/ecs/base";
import { WorldDoc } from "~/y-integration/WorldDoc";
import { MathUtils } from "three";

// Why 0.95? Allow loading state to finish even if there is a small handful of broken assets.
const MAX_THRESHOLD = 0.95;
/**
 * loading is a sub-state of worldState, i.e. when worldState is 'loading'
 * we have more detail here in these stores that can be used to show a progress
 * bar.
 */

export const entitiesMaximum: Writable<number> = writable(50);
export const assetsMaximum: Writable<number> = writable(50);
export const maximum: Readable<number> = derived(
  [entitiesMaximum, assetsMaximum],
  ([$entities, $assets], set) => {
    const newValue = $entities + $assets;
    set(newValue > 0 ? newValue : 1);
  },
  0
);

export const entitiesLoaded: Writable<number> = writable(0);
export const assetsLoaded: Writable<number> = writable(0);
export const loaded: Readable<number> = derived(
  [entitiesLoaded, assetsLoaded, maximum],
  ([$entities, $assets, $maximum], set) => {
    const newValue = $entities + $assets;
    set(newValue <= $maximum ? newValue : $maximum);
  },
  0
);

function countAssetsLoaded(world: World) {
  let count = 0;
  world.entities.entities.forEach((e) => {
    if (e.getByName("Model") && e.getByName("ModelMesh")) count++;
    else if (e.getByName("Image") || e.getByName("ImageMesh")) count++;
  });
  return count;
}

export function resetLoading(assetsCount, entitiesCount) {
  assetsMaximum.set(assetsCount);
  entitiesMaximum.set(entitiesCount);

  assetsLoaded.set(0);
  entitiesLoaded.set(0);
}

function countEntities(wdoc: WorldDoc) {
  entitiesLoaded.set(wdoc.entities.length);
}

function countAssets(wdoc: WorldDoc) {
  const loaded = countAssetsLoaded(wdoc.world);
  assetsLoaded.update(($loaded) => Math.max($loaded, loaded));
}

export const handleLoading = (startFn, wdoc) => (
  state: "loading" | "loaded" | "error"
) => {
  const intervals = [];
  let syntheticStep = 0;
  switch (state) {
    case "loading":
      intervals.push(setInterval(() => countAssets(wdoc), 100));
      intervals.push(setInterval(() => countEntities(wdoc), 100));
      intervals.push(
        setInterval(() => {
          const maximum = get(entitiesMaximum);
          const syntheticLoaded = Math.ceil(
            MathUtils.clamp((maximum / 10) * syntheticStep++, 0, maximum * 0.9)
          );
          assetsLoaded.update(($loaded) => Math.max($loaded, syntheticLoaded));
        }, 500)
      );
      const unsub = loaded.subscribe(($loaded) => {
        if ($loaded > get(maximum) * MAX_THRESHOLD) {
          intervals.forEach(clearInterval);
          startFn();
          unsub();
        }
      });
      break;
    case "loaded":
      entitiesLoaded.set(get(entitiesMaximum));
      break;
    case "error":
      intervals.forEach(clearInterval);
      worldState.set("error");
      break;
  }
};
