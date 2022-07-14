import type { Vector3 } from "three";

export type BoxParams = {
  type: "BOX";
  size: Vector3;
};

export type SphereParams = {
  type: "SPHERE";
  diameter: number;
  widthSegments: number;
  heightSegments: number;
};

export type CylinderParams = {
  type: "CYLINDER";
  diameter: number;
  height: number;
  segments: number;
};

export type CapsuleParams = {
  type: "CAPSULE";
  diameter: number;
  height: number;
  capSegments: number;
  radialSegments: number;
};

export type ShapeParams =
  | BoxParams
  | SphereParams
  | CylinderParams
  | CapsuleParams;

export type ShapeType = ShapeParams["type"];

export const MAX_SPHERE_WIDTH_SEGMENTS = 64;
export const MAX_SPHERE_HEIGHT_SEGMENTS = 64;
export const MAX_CYLINDER_SEGMENTS = 64;
export const MAX_CAPSULE_CAP_SEGMENTS = 16;
export const MAX_CAPSULE_RADIAL_SEGMENTS = 64;
