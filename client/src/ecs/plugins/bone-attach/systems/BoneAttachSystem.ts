import { Box3, Object3D, Vector3, Bone } from "three";
import { System, Groups, Entity, Not } from "~/ecs/base";
import { Object3DRef, Presentation } from "~/ecs/plugins/core";

import { BoneAttach, BoneAttachError, BoneAttachRef } from "../components";
import { ModelAttached } from "~/ecs/plugins/model";

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
    removed: [Not(BoneAttach), BoneAttachRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const spec: BoneAttach = entity.get(BoneAttach);
    const { parent, child } = entity.get(ModelAttached);
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
        const child = object.children[0];
        if (child) {
          const box = new Box3();
          box.setFromObject(child);
          const size = new Vector3();
          box.getSize(size);

          const container = new Object3D();
          container.position.copy(spec.offset);
          container.add(child);
          bone.add(container);

          return container;
        } else {
          console.warn(`can't attach to bone: object3d has no child`);
        }
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
      ref.bone.remove(ref.child);
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
