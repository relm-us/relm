import { derived } from "svelte/store"

import { viewport } from "./viewport"

const DEFAULT_SIZE = { width: 1, height: 1 }

const ResizeObserver = (window as any).ResizeObserver

export const viewportSize = derived(
  [viewport],
  ([$viewport], set) => {
    if ($viewport === null) {
      set(DEFAULT_SIZE)
    } else {
      const observer = new ResizeObserver(() => {
        set({
          width: $viewport.offsetWidth,
          height: $viewport.offsetHeight,
        })
      })
      observer.observe($viewport)

      // Cleanup function, called if viewport changes or last subscriber unsubscribes
      return () => {
        observer.unobserve($viewport)
      }
    }
  },
  DEFAULT_SIZE,
)
