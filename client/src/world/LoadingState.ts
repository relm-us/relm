import { get, writable, Writable } from "svelte/store";

type State = "init" | "loading-metadata" | "loading-assets" | "done";

/**
 * loadingState is a sub-state of worldState, i.e. when worldState is 'loading'
 * we have more detail here in these stores that can be used to show a progress
 * bar.
 */

export class LoadingState {
  state: Writable<State>;
  loaded: Writable<number>;
  max: Writable<number>;

  constructor() {
    this.state = writable("init");
    this.loaded = writable(0);
    this.max = writable(100);
  }

  setStateOnce(newState: State) {
    const $loading = get(this.state);
    if ($loading !== newState) {
      this.state.set(newState);
    }
  }

  setProgress(n) {
    this.loaded.set(n);
  }

  setMaximum(n) {
    this.max.set(n);
  }

  getMaximum() {
    return get(this.max);
  }
}
