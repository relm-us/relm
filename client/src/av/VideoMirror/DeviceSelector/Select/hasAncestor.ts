export default function hasAncestor(element, ancestor) {
  if (element === null) {
    return false
  } else if (element === ancestor) {
    return true
  } else {
    return hasAncestor(element.parentElement, ancestor)
  }
}
