import AvatarHead from "./AvatarHead.svelte";
import Billboard from "./Billboard.svelte";
import WebPage from "./WebPage.svelte";
import YouTube from "./YouTube.svelte";

export { YouTube, AvatarHead };

export function getRenderableComponentByType(type) {
  switch (type) {
    case "AVATAR_HEAD":
      return AvatarHead;
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
