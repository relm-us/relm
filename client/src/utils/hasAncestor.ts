export function hasAncestor(element: HTMLElement, ancestor: Node): boolean {
  if (element === null) {
    return false;
  } else if (element === ancestor) {
    return true;
  } else {
    return hasAncestor(element.parentElement, ancestor);
  }
}

export function hasPointerInteractAncestor(element: HTMLElement): boolean {
  if (element === null) {
    return false;
  } else if (element.dataset.pointerInteract) {
    return true;
  } else {
    return hasPointerInteractAncestor(element.parentElement);
  }
}

export function getAncestor(
  element: HTMLElement,
  ancestorTag: string
): HTMLElement {
  if (element === null) {
    return null;
  } else if (element.tagName === ancestorTag.toUpperCase()) {
    return element;
  } else {
    return getAncestor(element.parentElement, ancestorTag);
  }
}
