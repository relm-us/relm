import { ColliderDesc as RapierColliderDesc } from "@dimforge/rapier3d";

const MIN_SIZE = 0.01;

export function createColliderShape(rapier, spec, scale): RapierColliderDesc {
  switch (spec.shape) {
    case "BOX": {
      const size = spec.boxSize;
      const x = (scale.x * size.x) / 2;
      const y = (scale.y * size.y) / 2;
      const z = (scale.z * size.z) / 2;
      return rapier.ColliderDesc.cuboid(
        x > 0 ? x : MIN_SIZE,
        y > 0 ? y : MIN_SIZE,
        z > 0 ? z : MIN_SIZE
      );
    }
    case "SPHERE": {
      const max = Math.max(scale.x, scale.y, scale.z);
      const r = max * spec.sphereRadius;
      return rapier.ColliderDesc.ball(r > 0 ? r : MIN_SIZE);
    }
    case "CYLINDER": {
      const max = Math.max(scale.x, scale.z);
      const h = (scale.y * spec.cylinderHeight) / 2;
      const r = max * spec.cylinderRadius;
      return rapier.ColliderDesc.cylinder(
        h > 0 ? h : MIN_SIZE,
        r > 0 ? r : MIN_SIZE
      );
    }
    case "CAPSULE": {
      const max = Math.max(scale.x, scale.z);
      const h = (scale.y * spec.capsuleHeight) / 2;
      const r = max * spec.capsuleRadius;
      return rapier.ColliderDesc.capsule(
        h > 0 ? h : MIN_SIZE,
        r > 0 ? r : MIN_SIZE
      );
    }
    default:
      throw new Error(`Unknown collider shape: ${spec.shape}`);
  }
}
