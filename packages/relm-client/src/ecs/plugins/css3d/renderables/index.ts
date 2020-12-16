import AvatarHead from "./AvatarHead.svelte";
import WebPage from "./WebPage.svelte";
import YouTube from "./YouTube.svelte";

export { YouTube, AvatarHead };

export function getRenderableComponentByType(type) {
  switch (type) {
    case "AVATAR_HEAD":
      return AvatarHead;
    case "WEB_PAGE":
      return WebPage;
    case "YOUTUBE":
      return YouTube;
    default:
      throw new Error(`Unknown renderable component type: ${type}`);
  }
}
