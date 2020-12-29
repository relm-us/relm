import { writable, Writable, derived } from "svelte/store";

const DEFAULT_SIZE = { width: 1, height: 1 };
const DEFAULT_SCALE = 25.0;

const ResizeObserver = (window as any).ResizeObserver;

export const viewport: Writable<HTMLElement> = writable(null);

export const size = derived(
  [viewport],
  ([$viewport], set) => {
    if ($viewport === null) {
      set(DEFAULT_SIZE);
    } else {
      const setFromViewport = () => {
        set({
          width: $viewport.offsetWidth,
          height: $viewport.offsetHeight,
        });
      };

      const observer = new ResizeObserver(setFromViewport);
      observer.observe($viewport);

      // Cleanup function, called if viewport changes or last subscriber unsubscribes
      return () => {
        observer.unobserve($viewport);
      };
    }
  },
  DEFAULT_SIZE
);

export const scale: Writable<number> = writable(DEFAULT_SCALE);
