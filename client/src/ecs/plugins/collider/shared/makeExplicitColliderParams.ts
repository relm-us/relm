import type { Entity } from "~/ecs/base";
import type { ColliderParams } from "./types";

import { Quaternion, Vector3 } from "three";

import { Collider3 } from "../components";

export function makeExplicitColliderParams(entity: Entity): ColliderParams {
  const spec: Collider3 = entity.get(Collider3);
  return { spec, rotation: new Quaternion(), offset: new Vector3() };
}
