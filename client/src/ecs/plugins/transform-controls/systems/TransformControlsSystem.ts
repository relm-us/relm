import { Object3D } from "three";
import { TransformControls as ThreeTransformControls } from "three/examples/jsm/controls/TransformControls";

import { System, Groups, Entity, Not } from "~/ecs/base";
import { Presentation, Object3DRef, Transform } from "~/ecs/plugins/core";

import { TransformControls, TransformControlsRef } from "../components";
import { setControl } from "~/events/input/PointerListener/pointerActions";

export class TransformControlsSystem extends System {
  static selected: Entity = null;

  presentation: Presentation;

  order = Groups.Simulation;

  static queries = {
    added: [TransformControls, Object3DRef, Not(TransformControlsRef)],
    removed: [Not(TransformControls), TransformControlsRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update(delta) {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const spec: TransformControls = entity.get(TransformControls);
    const transform: Transform = entity.get(Transform);
    const object3d: Object3D = entity.get(Object3DRef).value;

    const controls = new ThreeTransformControls(
      this.presentation.camera,
      this.presentation.renderer.domElement.parentElement
    );

    this.presentation.scene.add(controls);

    let changed = false;
    controls.addEventListener("change", () => {
      // Update physics engine
      if (!transform.position.equals(object3d.position)) {
        transform.position.copy(object3d.position);
        changed = true;
      }
      if (!transform.rotation.equals(object3d.quaternion)) {
        transform.rotation.copy(object3d.quaternion);
        changed = true;
      }
      if (!transform.scale.equals(object3d.scale)) {
        transform.scale.copy(object3d.scale);
        changed = true;
      }
      if (changed) {
        transform.modified();
        spec.onChange?.();
      }
    });

    controls.addEventListener("mouseDown", () => {
      setControl(true);
    });
    controls.addEventListener("mouseUp", () => {
      setControl(false);
      spec.onMouseUp?.(entity);
    });

    controls.attach(object3d);

    entity.add(TransformControlsRef, { value: controls });
  }

  remove(entity: Entity) {
    const ref: TransformControlsRef = entity.get(TransformControlsRef);

    ref.value.detach();
    ref.value.dispose();

    entity.remove(TransformControlsRef);
  }
}
