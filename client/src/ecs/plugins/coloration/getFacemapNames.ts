export function getFacemapNames(node) {
  if ("facemaps" in node.userData) {
    return node.userData["facemaps"];
  } else if (node.parent) {
    return getFacemapNames(node.parent);
  } else {
    return null;
  }
}
