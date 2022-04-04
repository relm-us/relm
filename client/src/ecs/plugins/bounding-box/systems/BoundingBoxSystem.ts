import { Object3D } from "three";

import { System, Not, Modified, Groups } from "~/ecs/base";
import { Object3DRef, Presentation, Transform } from "~/ecs/plugins/core";
import { Queries } from "~/ecs/base/Query";

import { BoundingBox } from "../components";
import { ColliderDesc } from "@dimforge/rapier3d";
import { DecoratedECSWorld } from "~/types";

export class BoundingBoxSystem extends System {
  world: DecoratedECSWorld;
  presentation: Presentation;

  order = Groups.Initialization - 300;

  static queries: Queries = {
    new: [Transform, Object3DRef, Not(BoundingBox)],
    modified: [Modified(Transform), Object3DRef, BoundingBox],
    modifiedModel: [Transform, Modified(Object3DRef), BoundingBox],
    removed: [Not(Transform), BoundingBox],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.new.forEach((entity) => {
      entity.add(BoundingBox);
      this.updateBounds(entity);
      this.createCollider(entity);
    });

    this.queries.modified.forEach((entity) => {
      this.updateBounds(entity);
    });

    this.queries.modifiedModel.forEach((entity) => {
      this.updateBounds(entity);
    });

    this.queries.removed.forEach((entity) => {
      entity.remove(BoundingBox);
    });
  }

  updateBounds(entity) {
    const object3d: Object3D = entity.get(Object3DRef).value;
    const boundingBox: BoundingBox = entity.get(BoundingBox);

    boundingBox.box.setFromObject(object3d);
    boundingBox.box.getSize(boundingBox.size);

    boundingBox.modified();
  }

  createCollider(entity) {
    console.log('createCollider')
    const { world, rapier } = this.world.physics;

    const boundingBox: BoundingBox = entity.get(BoundingBox);

    const colliderDesc: ColliderDesc = rapier.ColliderDesc.cuboid(
      boundingBox.size.x,
      boundingBox.size.y,
      boundingBox.size.z
    );

    let collider = world.createCollider(colliderDesc);
    this.world.physics.handleToEntity.set(collider.handle, entity);
  }
}
