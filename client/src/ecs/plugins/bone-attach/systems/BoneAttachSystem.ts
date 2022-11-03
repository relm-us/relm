import { Box3, Object3D, Vector3, Bone } from "three";
import { System, Groups, Entity, Not, Modified } from "~/ecs/base";
import { Object3DRef, Presentation } from "~/ecs/plugins/core";

import { BoneAttach, BoneAttachError, BoneAttachRef } from "../components";
import { Model2Ref } from "~/ecs/plugins/form";

export class BoneAttachSystem extends System {
  presentation: Presentation;

  order = Groups.Simulation + 15;

  static queries = {
    added: [BoneAttach, Model2Ref, Not(BoneAttachRef), Not(BoneAttachError)],
    modified: [Modified(BoneAttach), Model2Ref],
    removed: [Not(BoneAttach), BoneAttachRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const spec: BoneAttach = entity.get(BoneAttach);
    const ref: Model2Ref = entity.get(Model2Ref);
    const child = ref.value.scene;
    const bone = this.findBone(child, spec.boneName);
    if (bone) {
      const child = this.attach(entity, bone);
      if (child) entity.add(BoneAttachRef, { bone, child });
      else entity.add(BoneAttachError);
    } else {
      console.warn(`bone not found`, spec.boneName);
      entity.add(BoneAttachError);
    }
  }

  attach(entity: Entity, bone: Bone) {
    const spec = entity.get(BoneAttach);
    const entityToAttach = this.world.entities.getById(spec.entityToAttachId);
    if (entityToAttach) {
      const object: Object3D = entityToAttach.get(Object3DRef)?.value;
      if (object) {
        // TODO: take bounding box size into consideration
        const box = new Box3();
        box.setFromObject(object);
        const size = new Vector3();
        box.getSize(size);

        const container = new Object3D();
        container.position.copy(spec.position);
        container.quaternion.copy(spec.rotation);
        container.scale.copy(spec.scale);
        container.add(object);
        (window as any).obj1 = object;

        bone.add(container);

        return container;
      } else {
        console.warn(
          `can't attach to bone: entityToAttach has no object3d`,
          entityToAttach
        );
      }
    } else {
      console.warn(
        `can't attach to bone: entity not found`,
        spec.entityToAttachId
      );
    }
  }

  remove(entity) {
    const ref: BoneAttachRef = entity.get(BoneAttachRef);
    if (ref) {
      ref.child.removeFromParent();
      entity.remove(BoneAttachRef);
    }
    entity.maybeRemove(BoneAttachError);
  }

  findBone(root: Object3D, boneName: string): Bone {
    let bone;
    root.traverse((node) => {
      if ((node as Bone).isBone && node.name === boneName) {
        bone = node;
      }
    });
    return bone;
  }
}
