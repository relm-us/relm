export function getFacemapNames(node) {
  if ("facemaps" in node.userData) {
    return node.userData.facemaps
  }

  if (node.parent) {
    return getFacemapNames(node.parent)
  }

  return null
}
