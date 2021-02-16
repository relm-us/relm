import {
  BoxBufferGeometry,
  SphereBufferGeometry,
  CylinderBufferGeometry,
} from "three";
import { CapsuleGeometry } from "./CapsuleGeometry";

const geometryCache: Map<string, any> = new Map();

function getCacheKeyForShape(shape) {
  let cacheKey = `${shape.kind}(`;
  switch (shape.kind) {
    case "BOX":
      cacheKey += `${shape.boxSize.x},${shape.boxSize.y},${shape.boxSize.y})`;
      break;
    case "SPHERE":
      cacheKey += `${shape.sphereRadius},${shape.sphereWidthSegments},${shape.sphereHeightSegments})`;
      break;
    case "CYLINDER":
      cacheKey += `${shape.cylinderRadius},${shape.cylinderHeight},${shape.cylinderSegments})`;
      break;
    case "CAPSULE":
      cacheKey += `${shape.capsuleRadius},${shape.capsuleHeight},${shape.capsuleSegments})`;
      break;
  }
  return cacheKey;
}

export function getGeometry(shape) {
  const cacheKey = getCacheKeyForShape(shape);
  if (geometryCache.has(cacheKey)) {
    return geometryCache.get(cacheKey);
  }
  switch (shape.kind) {
    case "BOX":
      const box = new BoxBufferGeometry(
        shape.boxSize.x,
        shape.boxSize.y,
        shape.boxSize.z
      );
      geometryCache.set(cacheKey, box);
      return box;
    case "SPHERE":
      const sphere = new SphereBufferGeometry(
        shape.sphereRadius,
        shape.sphereWidthSegments,
        shape.sphereHeightSegments
      );
      geometryCache.set(cacheKey, sphere);
      return sphere;
    case "CYLINDER":
      const cylinder = new CylinderBufferGeometry(
        shape.cylinderRadius,
        shape.cylinderRadius,
        shape.cylinderHeight,
        shape.cylinderSegments
      );
      geometryCache.set(cacheKey, cylinder);
      return cylinder;
    case "CAPSULE":
      const capsule = CapsuleGeometry(
        shape.capsuleRadius,
        shape.capsuleHeight,
        shape.capsuleSegments * 4
      );
      geometryCache.set(cacheKey, capsule);
      return capsule;
    default:
      throw new Error(`ShapeSystem: invalid shape.kind ${shape.kind}`);
  }
}
