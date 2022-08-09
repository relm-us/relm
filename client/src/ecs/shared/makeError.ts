import { Euler, Quaternion, Vector3 } from "three";
import type { DecoratedECSWorld } from "~/types";
import { nanoid } from "nanoid";

import { ERROR_GLTF } from "~/config/constants";

import { Entity } from "~/ecs/base";
import { Asset, Transform } from "~/ecs/plugins/core";
import { Model2 } from "~/ecs/plugins/form";
import { Asset as AssetComp } from "~/ecs/plugins/asset";
import { Html2d } from "~/ecs/plugins/html2d";
import { Clickable } from "../plugins/clickable";

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
    .add(AssetComp, { value: new Asset(ERROR_GLTF) })
    .add(Model2)
    .add(Html2d, {
      kind: "INFO",
      title: "Error",
      content: msg,
      zoomInvariant: false,
      vanchor: 2,
      hanchor: 1,
      offset: new Vector3(0.75, 1, 0)
    })
    .activate();
}
