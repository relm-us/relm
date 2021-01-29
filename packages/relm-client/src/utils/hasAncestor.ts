export function hasAncestor(element: HTMLElement, ancestor: Node): boolean {
  if (element === null) {
    return false;
  } else if (element === ancestor) {
    return true;
  } else {
    return hasAncestor(element.parentElement, ancestor);
  }
}
