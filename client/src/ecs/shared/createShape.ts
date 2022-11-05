import type { ColliderDesc as RapierColliderDesc } from "@dimforge/rapier3d";

import {
  Vector3,
  BufferGeometry,
  CapsuleGeometry,
  BoxGeometry,
  SphereGeometry,
  CylinderGeometry,
  MathUtils,
} from "three";

import {
  ShapeType,
  ShapeParams,
  BoxParams,
  CapsuleParams,
  CylinderParams,
  SphereParams,
  MAX_SPHERE_WIDTH_SEGMENTS,
  MAX_SPHERE_HEIGHT_SEGMENTS,
  MAX_CYLINDER_SEGMENTS,
  MAX_CAPSULE_CAP_SEGMENTS,
  MAX_CAPSULE_RADIAL_SEGMENTS,
} from "~/types/shapes";

const MIN_DETAIL = 0.01;
const MIN_DIAMETER = 0.01;
const MIN_HEIGHT = 0.04;

function segments(proportion: number, max: number) {
  return Math.ceil(MathUtils.clamp(proportion, MIN_DETAIL, 1.0) * max);
}

export function createBox(size: Vector3): BoxParams {
  return {
    type: "BOX",
    size: new Vector3(
      Math.max(size.x, MIN_HEIGHT),
      Math.max(size.y, MIN_HEIGHT),
      Math.max(size.z, MIN_HEIGHT)
    ),
  };
}

export function createSphere(
  diameter: number,
  detail: number = 1.0
): SphereParams {
  return {
    type: "SPHERE",
    diameter: Math.max(diameter, MIN_DIAMETER),
    widthSegments: segments(detail, MAX_SPHERE_WIDTH_SEGMENTS),
    heightSegments: segments(detail, MAX_SPHERE_HEIGHT_SEGMENTS),
  };
}

export function createCylinder(
  diameter: number,
  height: number,
  detail: number = 1.0
): CylinderParams {
  return {
    type: "CYLINDER",
    diameter: Math.max(diameter, MIN_DIAMETER),
    height: Math.max(height, MIN_HEIGHT),
    segments: segments(detail, MAX_CYLINDER_SEGMENTS),
  };
}

export function createCapsule(
  diameter: number,
  height: number,
  detail: number = 1.0
): CapsuleParams {
  return {
    type: "CAPSULE",
    diameter: Math.max(diameter, MIN_DIAMETER),
    height: Math.max(height, MIN_HEIGHT),
    capSegments: segments(detail, MAX_CAPSULE_CAP_SEGMENTS),
    radialSegments: segments(detail, MAX_CAPSULE_RADIAL_SEGMENTS),
  };
}

export function toShapeParams(
  type: ShapeType,
  size: Vector3,
  detail: number = 1.0
): ShapeParams {
  switch (type) {
    case "BOX":
      return createBox(size);
    case "SPHERE":
      return createSphere(size.x, detail);
    case "CYLINDER":
      return createCylinder(size.x, size.y, detail);
    case "CAPSULE":
      return createCapsule(size.x, size.y, detail);
  }
}

export function shapeParamsToGeometry(
  shape: ShapeParams,
  padding: number = 0
): BufferGeometry {
  switch (shape.type) {
    case "BOX":
      return new BoxGeometry(
        shape.size.x + padding * 2,
        shape.size.y + padding * 2,
        shape.size.z + padding * 2
      );

    case "SPHERE":
      return new SphereGeometry(
        shape.diameter / 2 + padding,
        shape.widthSegments,
        shape.heightSegments
      );

    case "CYLINDER":
      return new CylinderGeometry(
        shape.diameter / 2 + padding,
        shape.diameter / 2 + padding,
        shape.height + padding * 2,
        shape.segments
      );

    case "CAPSULE":
      return new CapsuleGeometry(
        shape.diameter / 2 + padding,
        shape.height + padding * 2,
        shape.capSegments,
        shape.radialSegments
      );
  }
}

export function shapeParamsToColliderDesc(
  rapier,
  shape: ShapeParams
): RapierColliderDesc {
  switch (shape.type) {
    case "BOX":
      return rapier.ColliderDesc.cuboid(
        shape.size.x / 2,
        shape.size.y / 2,
        shape.size.z / 2
      );

    case "SPHERE":
      return rapier.ColliderDesc.ball(shape.diameter / 2);

    case "CYLINDER":
      return rapier.ColliderDesc.cylinder(shape.height / 2, shape.diameter / 2);

    case "CAPSULE":
      return rapier.ColliderDesc.capsule(shape.height / 2, shape.diameter / 2);
  }
}
