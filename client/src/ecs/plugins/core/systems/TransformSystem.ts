import * as THREE from "three";
import { Object3D } from "three";

import { System, Not, Modified, Groups, Entity } from "~/ecs/base";
import { Queries } from "~/ecs/base/Query";

import { Transform, Object3DRef } from "../components";
import { Presentation } from "../Presentation";

export class TransformSystem extends System {
  frame: number;
  presentation: Presentation;

  order = Groups.Initialization - 400;

  static queries: Queries = {
    new: [Transform, Not(Object3DRef)],
    modified: [Modified(Transform), Object3DRef],
    removed: [Not(Transform), Object3DRef],
  };

  init({ presentation }) {
    this.frame = 0;
    this.presentation = presentation;
  }

  update() {
    // Used for caching recursive updates:
    this.frame++;

    this.queries.new.forEach((entity) => {
      this.createObject3D(entity);
    });

    this.queries.modified.forEach((entity) => {
      // Update this entity and its children, since we only flag the
      // top-most Transform as "modified()":
      entity.traverse((e) => {
        this.updateWorldTransform(e);
      });
    });

    this.queries.removed.forEach((entity) => {
      this.removeObject3D(entity);
    });
  }

  createObject3D(entity: Entity) {
    const transform: Transform = entity.get(Transform);

    const object3d = new THREE.Object3D();

    object3d.uuid = entity.id as string;
    object3d.name = entity.name;
    object3d.matrixAutoUpdate = false;

    // We have our own frustum culling, so disable built-in threejs culling
    object3d.frustumCulled = false;

    // Usually, we set the entityId to the ECS entity.id, but sometimes
    // it's useful to be deceptive, as in the case of an "error" object
    object3d.userData.entityId = transform.entityId || entity.id;

    let parent;
    if (!entity.parent) {
      parent = this.presentation.scene;
    } else {
      const object3d = entity.getParent()?.get(Object3DRef)?.value;
      if (object3d) {
        parent = object3d;
      } else {
        // Wait until next loop to make this
        return;
      }
    }

    parent.add(object3d);
    entity.add(Object3DRef, { value: object3d });

    this.updateWorldTransform(entity);
  }

  // Here's where we tell each Three.js object what its position, rotation,
  // and scale is, both within local and world coordinate systems.
  updateWorldTransform(entity: Entity) {
    const transform: Transform = entity.get(Transform);
    if (!transform) return;

    const o3dref: Object3DRef = entity.get(Object3DRef);
    const object3d: Object3D = o3dref.value;

    const parent = entity.getParent();

    if (transform.frame === this.frame) {
      return object3d;
    }

    this.updateObject3DFromTransform(object3d, transform);

    if (parent && parent.has(Object3DRef)) {
      // Recursively update any parent WorldTransform whose frame
      // is not equal to the current frame:
      const parentObject3D = this.updateWorldTransform(parent);

      object3d.matrixWorld.multiplyMatrices(
        parentObject3D.matrix,
        object3d.matrix
      );
    } else {
      object3d.matrixWorld.copy(object3d.matrix);
    }

    object3d.matrixWorld.decompose(
      transform.positionWorld,
      transform.rotationWorld,
      transform.scaleWorld
    );

    transform.frame = this.frame;

    return object3d;
  }

  updateObject3DFromTransform(object3d: Object3D, transform: Transform) {
    object3d.position.copy(transform.position);
    object3d.quaternion.copy(transform.rotation);
    object3d.scale.copy(transform.scale);
    object3d.updateMatrix();
  }

  removeObject3D(entity: Entity) {
    const object3d: Object3D = entity.get(Object3DRef).value;
    object3d.removeFromParent();
    entity.remove(Object3DRef);
  }
}
