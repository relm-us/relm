import { ConvexPolyhedron } from "@dimforge/rapier3d";
import { Vector3, PerspectiveCamera } from "three";
import { CAMERA_FRUSTUM_FAR_PLANE } from "~/config/constants";

export function getCameraFrustumVertices(
  camera: PerspectiveCamera,
  far: number = null,
  padding: number = 0
) {
  const n = camera.near + padding;
  const f = far ?? camera.far + padding;

  const halfPI = Math.PI / 180;
  const fov = camera.fov * halfPI; // convert degrees to radians

  // Near Plane dimensions (near width, near height)
  const nH = 2 * Math.tan(fov / 2) * n - padding;
  const nW = nH * camera.aspect - padding; // width

  // Far Plane dimensions (far width, far height)
  const fH = 2 * Math.tan(fov / 2) * f - padding; // height
  const fW = fH * camera.aspect - padding; // width

  const vertices = [
    new Vector3(nW / 2, nH / 2, -n),
    new Vector3(-nW / 2, nH / 2, -n),
    new Vector3(nW / 2, -nH / 2, -n),
    new Vector3(-nW / 2, -nH / 2, -n),
    new Vector3(fW / 2, fH / 2, -f),
    new Vector3(-fW / 2, fH / 2, -f),
    new Vector3(fW / 2, -fH / 2, -f),
    new Vector3(-fW / 2, -fH / 2, -f),
  ];

  return vertices;
}

export function getFrustumShape(
  camera: PerspectiveCamera,
  rapier
): ConvexPolyhedron {
  const vertices = getCameraFrustumVertices(
    camera,
    CAMERA_FRUSTUM_FAR_PLANE,
    -3
  );
  return new rapier.ConvexPolyhedron(vertices.flatMap((v) => [v.x, v.y, v.z]));
}
