export function hasAncestor(element: HTMLElement, ancestor: Node): boolean {
  if (element === null) {
    return false
  }

  if (element === ancestor) {
    return true
  }

  return hasAncestor(element.parentElement, ancestor)
}

export function hasPointerInteractAncestor(element: HTMLElement): boolean {
  if (element === null) {
    return false
  }

  if (element.dataset.pointerInteract) {
    return true
  }

  return hasPointerInteractAncestor(element.parentElement)
}

export function getAncestor(element: HTMLElement, ancestorTag: string): HTMLElement {
  if (element === null) {
    return null
  }

  if (element.tagName === ancestorTag.toUpperCase()) {
    return element
  }

  return getAncestor(element.parentElement, ancestorTag)
}
