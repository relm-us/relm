import { System, Groups, Not } from "hecs";
import { Transform } from "hecs-plugin-core";
import { Quaternion, Vector3 } from "three";

import { CompositeTransform } from "../components/CompositeTransform";

export class CompositeTransformSystem extends System {
  order = Groups.Simulation;

  static queries = {
    new: [CompositeTransform, Not(Transform)],
    active: [CompositeTransform, Transform],
  };

  update(delta) {
    this.queries.new.forEach((entity) => {
      entity.add(Transform);
    });
    this.queries.active.forEach((entity) => {
      this.updateCompositeTransform(entity);
    });
  }

  updateCompositeTransform(entity) {
    const transform = entity.get(Transform);
    const composite = entity.get(CompositeTransform);

    transform.position.copy(composite.position);
    transform.rotation.copy(composite.rotation);
    transform.scale.copy(composite.scale);

    // Loop through each offset to create a composite offset
    let offset: { position?: Vector3; rotation?: Quaternion; scale?: Vector3 };
    for (offset of Object.values(composite.offsets)) {
      if (offset.position) {
        transform.position.add(offset.position);
      }
      if (offset.rotation) {
        transform.rotation.multiply(offset.rotation);
      }
      if (offset.scale) {
        transform.scale.multiply(offset.scale);
      }
    }
  }
}
