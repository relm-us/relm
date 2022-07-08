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
