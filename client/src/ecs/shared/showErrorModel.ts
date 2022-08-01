import type { Group } from "three";
import type { DecoratedECSWorld } from "~/types";

import { Entity } from "~/ecs/base";
import { clone } from "~/ecs/shared/SkeletonUtils";

import { ERROR_GLTF } from "~/config/constants";
import { firstTimePrepareScene } from "./firstTimePrepareScene";

let errorModel;
let loadedOnce = false;

export function showErrorModel(
  entity: Entity,
  msg = null,
  attachCallback: (model: Group) => void
) {
  if (!loadedOnce) {
    const world = entity.world as DecoratedECSWorld;
    world.presentation.loadGltf(ERROR_GLTF).then((gltf) => {
      errorModel = firstTimePrepareScene(gltf.scene, false, false);
    });
    loadedOnce = true;
  }

  if (errorModel) {
    if (msg) {
      console.warn(msg, entity.id);
    }

    entity.addByName("Html2d", {
      kind: "INFO",
      title: "Error",
      content: msg,
      zoomInvariant: false,
    });

    attachCallback(clone(errorModel));
  } else {
    // try again next loop
    return;
  }
}
