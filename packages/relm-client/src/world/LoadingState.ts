import { writable, Writable } from "svelte/store";

type State = "init" | "loading-metadata" | "loading-assets" | "done";

/**
 * loadingState is a sub-state of worldState, i.e. when worldState is 'loading'
 * we have more detail here in these stores that can be used to show a progress
 * bar.
 */

export class LoadingState {
  state: Writable<State>;
  assetsLoaded: Writable<number>;
  assetsMax: Writable<number>;

  constructor() {
    this.state = writable("init");
    this.assetsLoaded = writable(0);
    this.assetsMax = writable(null);
  }

  setProgress(n) {
    this.assetsLoaded.set(n);
  }

  setMaximum(n) {
    this.assetsMax.set(n);
  }
}
