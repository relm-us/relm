import { BufferGeometry, Color, Mesh, MeshStandardMaterial } from "three";
import { System, Groups, Not, Modified, Entity } from "~/ecs/base";
import {
  RigidBody,
  RigidBodyRef,
  Collider,
  ColliderRef,
  ColliderVisible,
} from "../components";
import { Object3D, Transform, WorldTransform } from "~/ecs/plugins/core";
import { ColliderDesc as RapierColliderDesc } from "@dimforge/rapier3d";
import { getGeometry } from "~/ecs/plugins/shape/ShapeCache";
import { get } from "svelte/store";
import { mode } from "~/stores/mode";
import { InvisibleToMouse } from "~/ecs/components/InvisibleToMouse";

const MIN_SIZE = 0.01;

function colliderToShape(collider) {
  return {
    kind: collider.shape,
    boxSize: collider.boxSize,
    sphereRadius: collider.sphereRadius,
    sphereWidthSegments: 16,
    sphereHeightSegments: 12,
    capsuleRadius: collider.capsuleRadius,
    capsuleHeight: collider.capsuleHeight,
    capsuleSegments: 5,
  };
}

export class ColliderSystem extends System {
  order = Groups.Presentation + 250; // After WorldTransform

  static queries = {
    added: [Collider, Not(ColliderRef), RigidBodyRef],
    modifiedBody: [ColliderRef, Modified(RigidBody)],
    modifiedTransform: [ColliderRef, Modified(Transform)],
    modified: [Modified(Collider), RigidBodyRef],
    removed: [Not(Collider), ColliderRef],

    needsVisible: [Collider, Not(InvisibleToMouse), Not(ColliderVisible)],
    needsHidden: [ColliderVisible],
  };

  update() {
    const $mode = get(mode);

    // create new ColliderRef
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modifiedBody.forEach((entity) => {
      this.remove(entity);
    });
    this.queries.modifiedTransform.forEach((entity) => {
      this.remove(entity);
    });
    // replace ColliderRef with new spec
    this.queries.modified.forEach((entity) => {
      this.build(entity);
      this.removeVisible(entity);
    });
    // Remove ColliderRef
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });

    if ($mode === "build") {
      this.queries.needsVisible.forEach((entity) => {
        this.buildVisible(entity);
      });
    } else if ($mode === "play") {
      this.queries.needsHidden.forEach((entity) => {
        this.removeVisible(entity);
      });
    }
  }

  build(entity: Entity) {
    const spec = entity.get(Collider);
    const rigidBodyRef = entity.get(RigidBodyRef);
    const colliderRef = entity.get(ColliderRef);
    const { world, rapier } = (this.world as any).physics;

    const worldTransform = entity.get(WorldTransform);

    // Create a cuboid collider attached to rigidBody.
    let colliderDesc: RapierColliderDesc;
    const scale = worldTransform.scale;
    switch (spec.shape) {
      case "BOX": {
        const size = spec.boxSize;
        const x = (scale.x * size.x) / 2;
        const y = (scale.y * size.y) / 2;
        const z = (scale.z * size.z) / 2;
        colliderDesc = rapier.ColliderDesc.cuboid(
          x > 0 ? x : MIN_SIZE,
          y > 0 ? y : MIN_SIZE,
          z > 0 ? z : MIN_SIZE
        );
        break;
      }
      case "SPHERE": {
        const max = Math.max(scale.x, scale.y, scale.z);
        const r = max * spec.sphereRadius;
        colliderDesc = rapier.ColliderDesc.ball(r > 0 ? r : MIN_SIZE);
        break;
      }
      case "CAPSULE": {
        const max = Math.max(scale.x, scale.z);
        const h = (scale.y * spec.capsuleHeight) / 2;
        const r = max * spec.capsuleRadius;
        colliderDesc = rapier.ColliderDesc.capsule(
          h > 0 ? h : MIN_SIZE,
          r > 0 ? r : MIN_SIZE
        );
        break;
      }
      default:
        throw new Error(`Unknown collider shape: ${spec.shape}`);
    }

    colliderDesc.setDensity(spec.density);
    colliderDesc.setCollisionGroups(spec.interaction);

    if (colliderRef) {
      world.removeCollider(colliderRef.value);
    }

    let collider = world.createCollider(
      colliderDesc,
      rigidBodyRef.value.handle
    );
    if (collider.handle === undefined) {
      console.error("Collider handle undefined", collider, rigidBodyRef.value);
    }

    entity.add(ColliderRef, { value: collider });
  }

  remove(entity) {
    const { world } = (this.world as any).physics;
    const colliderRef = entity.get(ColliderRef);

    world.removeCollider(colliderRef.value);
    entity.remove(ColliderRef);
  }

  buildVisible(entity) {
    const collider = entity.get(Collider);
    const object3d = entity.get(Object3D).value;

    // Prevent things like ground and avatar from showing collider shapes
    if (object3d.userData.invisibleToMouse) return;

    const shapeSpec = colliderToShape(collider);
    const geometry: BufferGeometry = getGeometry(shapeSpec);

    const material = new MeshStandardMaterial({
      color: new Color("#333333"),
      roughness: 0.5,
      metalness: 0.5,
      emissive: new Color("#333333"),
      transparent: true,
      opacity: 0.5,
    });
    const mesh = new Mesh(geometry, material);
    mesh.scale.multiplyScalar(0.99);

    object3d.add(mesh);
    entity.add(ColliderVisible, { value: mesh });
  }

  removeVisible(entity) {
    if (!entity.has(Object3D)) return;
    const object3d = entity.get(Object3D).value;

    if (!entity.has(ColliderVisible)) return;
    const mesh = entity.get(ColliderVisible).value;

    object3d.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();

    entity.remove(ColliderVisible);
  }
}
