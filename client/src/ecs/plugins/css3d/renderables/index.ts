import Billboard from "./Billboard.svelte";
import WebPage from "./WebPage.svelte";
import YouTube from "./YouTube.svelte";

export function getRenderableComponentByType(type) {
  switch (type) {
    case "BILLBOARD":
    case "LABEL": // backwards compat
      return Billboard;
    case "WEB_PAGE":
      return WebPage;
    case "YOUTUBE":
      return YouTube;
    default:
      throw new Error(`Unknown renderable component type: ${type}`);
  }
}
