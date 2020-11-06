import { System, Groups, Not } from "hecs";
import { Transform, Quaternion, Vector3 } from "hecs-plugin-core";

import { ComposableTransform } from "../components/ComposableTransform";

export class ComposableTransformSystem extends System {
  order = Groups.Simulation;

  static queries = {
    new: [ComposableTransform, Not(Transform)],
    active: [ComposableTransform, Transform],
  };

  update() {
    this.queries.new.forEach((entity) => {
      const composable = entity.get(ComposableTransform);
      if (Object.values(composable.positionOffsets).length > 0) {
        composable.hasPositionOffsets = true;
      }
      if (Object.values(composable.rotationOffsets).length > 0) {
        composable.hasRotationOffsets = true;
      }
      if (Object.values(composable.scaleOffsets).length > 0) {
        composable.hasScaleOffsets = true;
      }
      entity.add(Transform);
    });
    this.queries.active.forEach((entity) => {
      this.updateComposableTransform(entity);
    });
  }

  updateComposableTransform(entity) {
    const transform = entity.get(Transform);
    const composable = entity.get(ComposableTransform);

    transform.position.copy(composable.position);
    transform.rotation.copy(composable.rotation);
    transform.scale.copy(composable.scale);

    // Loop through each offset to create composite offsets

    if (composable.hasPositionOffsets) {
      for (const offset of Object.values(composable.positionOffsets)) {
        transform.position.add(offset);
      }
    }

    if (composable.hasRotationOffsets) {
      for (const offset of Object.values(composable.rotationOffsets)) {
        transform.rotation.multiply(offset);
      }
    }

    if (composable.hasScaleOffsets) {
      for (const offset of Object.values(composable.scaleOffsets)) {
        transform.scale.multiply(offset);
      }
    }
  }
}
