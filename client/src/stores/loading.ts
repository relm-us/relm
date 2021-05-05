import { MathUtils } from "three";
import { get, writable, derived, Readable, Writable } from "svelte/store";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { ImageRef } from "~/ecs/plugins/image";
import { ModelRef } from "~/ecs/plugins/model";
import { World } from "~/ecs/base";

const MAX_THRESHOLD = 1.0;

/**
 * Track loading state as a store
 */
export type LoadingState = "initial" | "loading" | "loaded" | "error";
export const loadingState: Writable<LoadingState> = writable("initial");

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
    if (e.get(ModelRef)) count++;
    else if (e.get(ImageRef)) count++;
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
  const count = wdoc.entities.length;
  entitiesLoaded.update(($loaded) => Math.max($loaded, count));
}

function countAssets(wdoc: WorldDoc) {
  const count = countAssetsLoaded(wdoc.world);
  assetsLoaded.update(($loaded) => Math.max($loaded, count));
}

const intervals = [];
let syntheticStep = 0;

export function startPollingLoadingState(wdoc, onDone?: Function) {
  if (intervals.length > 0) stopPollingLoadingState();

  intervals.length = 0;
  syntheticStep = 0;

  intervals.push(setInterval(() => countAssets(wdoc), 100));
  intervals.push(setInterval(() => countEntities(wdoc), 100));
  intervals.push(
    setInterval(() => {
      const maximum = get(entitiesMaximum);
      const syntheticLoaded = Math.ceil(
        MathUtils.clamp((maximum / 20) * syntheticStep++, 0, maximum * 0.9)
      );
      entitiesLoaded.update(($loaded) => Math.max($loaded, syntheticLoaded));
    }, 500)
  );
  const unsub = loaded.subscribe(($loaded) => {
    if ($loaded >= get(maximum) * MAX_THRESHOLD) {
      stopPollingLoadingState();
      unsub();
      onDone?.();
    }
  });
}

export function stopPollingLoadingState() {
  intervals.forEach(clearInterval);
}
