import { Box3, Object3D, Object3D as ThreeObject3D, Vector3 } from "three";
import { System, Groups, Entity, Not } from "~/ecs/base";
import { Object3DRef, Presentation } from "~/ecs/plugins/core";

import { BoneAttach, BoneAttachError, BoneAttachRef } from "../components";
import { ModelAttached } from "~/ecs/plugins/model";
import { Bone } from "three";

const HAND_LENGTH = 0.25;

export class BoneAttachSystem extends System {
  presentation: Presentation;

  // After both AnimationSystem and PointerPositionSystem
  order = Groups.Simulation + 15;

  static queries = {
    added: [
      BoneAttach,
      ModelAttached,
      Not(BoneAttachRef),
      Not(BoneAttachError),
    ],
    active: [BoneAttach, BoneAttachRef],
    removed: [Not(BoneAttach), BoneAttachRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    // TODO
    // this.queries.active.forEach((entity) => {
    //   const spec = entity.get(BoneAttach);
    // });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const spec = entity.get(BoneAttach);
    const { parent, child } = entity.get(ModelAttached);
    let bone;
    child.traverse((node) => {
      if (node.isBone && node.name === spec.boneName) {
        bone = node;
      }
    });
    if (bone) {
      this.attach(bone, spec.entityToAttachId);
      entity.add(BoneAttachRef, { value: bone, parent });
    } else {
      console.warn(`bone not found`, spec.boneName);
      entity.add(BoneAttachError);
    }
  }

  attach(bone: Bone, entityToAttachId: string) {
    const entityToAttach = this.world.entities.getById(entityToAttachId);
    if (entityToAttach) {
      const object: Object3D = entityToAttach.get(Object3DRef)?.value;
      if (object) {
        const child = object.children[0];
        if (child) {
          const box = new Box3();
          box.setFromObject(child);
          const size = new Vector3();
          box.getSize(size);

          const container = new ThreeObject3D();
          container.position.y = size.y + HAND_LENGTH;
          container.add(child);
          bone.add(container);
        } else console.warn(`can't attach to bone: object3d has no child`);
      } else {
        console.warn(
          `can't attach to bone: entityToAttach has no object3d`,
          entityToAttach
        );
      }
    } else {
      console.warn(`can't attach to bone: entity not found`, entityToAttachId);
    }
  }

  remove(entity) {
    const ref = entity.get(BoneAttachRef);
    if (ref) {
      const child = ref.value.children[0];
      if (child) ref.value.remove(child);
      entity.remove(BoneAttachRef);
    }
    entity.maybeRemove(BoneAttachError);
  }
}
