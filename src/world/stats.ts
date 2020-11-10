import { writable, Writable, derived } from "svelte/store";

import { store as worldStore } from "./store";

const DATA_WINDOW_SIZE = 100;

type StatsStore = {
  subscribe: Function;
  addData: (data: number) => void;
};

function createStatsStore(dataWindowSize): StatsStore {
  const store: Writable<Array<number>> = writable([]);

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
  };
}

// Gathered from clocking the render loop
export const totalTime = createStatsStore(DATA_WINDOW_SIZE);
export const deltaTime = createStatsStore(DATA_WINDOW_SIZE);
export const fpsTime = createStatsStore(DATA_WINDOW_SIZE);

// Gathered from renderer.info (https://threejs.org/docs/#api/en/renderers/WebGLRenderer.info)
export const memoryGeometries = createStatsStore(DATA_WINDOW_SIZE);
export const memoryTextures = createStatsStore(DATA_WINDOW_SIZE);
export const renderCalls = createStatsStore(DATA_WINDOW_SIZE);
export const renderTriangles = createStatsStore(DATA_WINDOW_SIZE);
export const renderPoints = createStatsStore(DATA_WINDOW_SIZE);
export const renderLines = createStatsStore(DATA_WINDOW_SIZE);
export const renderFrames = createStatsStore(DATA_WINDOW_SIZE);

export const programs = writable([]);
