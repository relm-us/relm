import YouTube from "./YouTube.svelte";

export { YouTube };

export function getRenderableComponentByType(type) {
  switch (type) {
    case "YOUTUBE":
      return YouTube;
    default:
      throw new Error(`Unknown renderable component type: ${type}`);
  }
}
