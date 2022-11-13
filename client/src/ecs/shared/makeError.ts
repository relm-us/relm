import { Euler, Quaternion, Vector3 } from "three";
import { nanoid } from "nanoid";

import { Entity } from "~/ecs/base";
import { Asset, Transform } from "~/ecs/plugins/core";
import { Model3 } from "~/ecs/plugins/model";
import { Html2d } from "~/ecs/plugins/html2d";

import errorCatGlb from "./error-cat.glb";

export function makeError(entity: Entity, msg = null) {
  const transform: Transform = entity.get(Transform);

  if (msg) {
    console.warn(msg, entity.id);
  }

  return entity.world.entities
    .create("Error", nanoid())
    .add(Transform, {
      position: new Vector3().copy(transform.position),
      rotation: new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0)),
      scale: new Vector3(0.5, 0.5, 0.5),
      // Make it so that clicking on the error entity forwards to the original
      entityId: entity.id,
    })
    .add(Model3, {
      asset: new Asset(errorCatGlb),
    })
    .add(Html2d, {
      kind: "INFO",
      title: "Error",
      content: msg,
      zoomInvariant: false,
      vanchor: 2,
      hanchor: 1,
      offset: new Vector3(0.75, 1, 0),
    })
    .activate();
}
