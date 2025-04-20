import { type Readable, type Writable, writable } from "svelte/store";

export const DATA_WINDOW_SIZE = 20;

interface StatsStore extends Readable<Array<number>> {
  subscribe: (run: (value: number[]) => any, invalidate?: any) => any;
  addData: (data: number) => void;
  clear: () => void;
}

export function createStatsStore(dataWindowSize): StatsStore {
  const store: Writable<Array<number>> = writable([0]);

  const addDataPoint = (datapoint) => {
    store.update((existing) => {
      existing.unshift(datapoint);
      if (existing.length > dataWindowSize) {
        existing.pop();
      }
      return existing;
    });
  };

  return {
    subscribe: store.subscribe,
    addData: addDataPoint,
    clear: () => store.set([0]),
  };
}

// Gathered from clocking the render loop
export const totalTime = createStatsStore(DATA_WINDOW_SIZE);
export const fpsTime = createStatsStore(DATA_WINDOW_SIZE);

// Gathered from renderer.info (https://threejs.org/docs/#api/en/renderers/WebGLRenderer.info)
export const memoryGeometries = createStatsStore(DATA_WINDOW_SIZE);
export const memoryTextures = createStatsStore(DATA_WINDOW_SIZE);
export const renderCalls = createStatsStore(DATA_WINDOW_SIZE);
export const renderTriangles = createStatsStore(DATA_WINDOW_SIZE);
export const renderFrames = createStatsStore(DATA_WINDOW_SIZE);

export const programs = writable([]);

// Gathered from profiling the ECS system loop
export const systems: Writable<Record<string, StatsStore>> = writable({});
