import type { Entity } from "~/ecs/base";
import type { ColliderParams } from "./types";

import { Quaternion, Vector3 } from "three";

import { Transform } from "~/ecs/plugins/core";

import { Collider3 } from "../components";

export function makeExplicitColliderParams(entity: Entity): ColliderParams {
  const spec: Collider3 = entity.get(Collider3);

  let rotation = new Quaternion();
  let offset = new Vector3();
  let scale = entity.get(Transform).scale;

  return { spec, offset, rotation, scale };
}
