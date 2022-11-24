import type { Quaternion, Vector3 } from "three";
import type { Collider3 } from "../components";

export type ColliderParams = {
  spec: Collider3;
  rotation: Quaternion;
  offset: Vector3;
};
