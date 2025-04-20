import type { Writable } from "svelte/store"
import { storedWritable } from "~/utils/storedWritable"

/**
 * 3D Render Quality and Speed
 *
 * 0: lowest quality
 * 1: low quality
 * 2: medium quality (default)
 * 3: high quality
 * 4: highest quality
 */
export const graphicsQuality: Writable<number> = storedWritable("quality", 2)
