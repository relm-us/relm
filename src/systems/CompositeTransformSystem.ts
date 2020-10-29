import { System, Groups, Not } from "hecs";
import { Transform } from "hecs-plugin-core";

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
    const tf = entity.get(Transform);
    const composite = entity.get(CompositeTransform);
    tf.position.copy(composite.position);
    tf.rotation.copy(composite.rotation);
    tf.scale.copy(composite.scale);

    // Loop through each offset to create a composite offset
    let offset: any;
    for (offset of Object.values(composite.offsets)) {
      if (offset.position) {
        tf.position.add(offset.position);
      }
      if (offset.rotation) {
        // TODO: learn enough to combine rotations
        //  e.g. https://marctenbosch.com/quaternions/
        tf.rotation.multiply(offset.rotation);
      }
      if (offset.scale) {
        tf.scale.multiply(offset.scale);
      }
    }
  }
}
