import { HtmlNode } from "~ecs/plugins/css3d";

export function hasAncestor(element: HtmlNode, ancestor: HtmlNode): boolean {
  if (element === null) {
    return false;
  } else if (element === ancestor) {
    return true;
  } else {
    return hasAncestor(element.parentNode, ancestor);
  }
}
