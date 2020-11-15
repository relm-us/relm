import YouTube from "./YouTube.svelte";
import AvatarHead from "./AvatarHead.svelte";

export { YouTube, AvatarHead };

export function getRenderableComponentByType(type) {
  switch (type) {
    case "YOUTUBE":
      return YouTube;
    case "AVATAR_HEAD":
      return AvatarHead;
    default:
      throw new Error(`Unknown renderable component type: ${type}`);
  }
}
