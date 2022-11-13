import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

import { Group, Object3D } from "three";

import { Entity, System, Not, Modified, Groups, EntityId } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";
import { clone } from "~/ecs/shared/SkeletonUtils";
import { makeError } from "~/ecs/shared/makeError";

import {
  Model3,
  ModelAssetLoaded,
  ModelAssetLoading,
  ModelRef,
} from "../components";

import { firstTimePrepareScene } from "../utils/firstTimePrepareScene";

const cache: Map<string, Group> = new Map();

export class ModelSystem extends System {
  errorScene: Group;

  // Must be after AssetSystem
  order = Groups.Initialization + 10;

  static queries = {
    added: [Model3, ModelAssetLoaded, Not(ModelRef)],
    removed: [ModelRef, Not(Model3)],
    modified: [Modified(Model3), ModelRef],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
    this.queries.modified.forEach((entity) => {
      const spec: Model3 = entity.get(Model3);
      if (spec.needsRebuild) {
        this.remove(entity);
      } else {
        this.updateOffset(entity);
      }
    });
  }

  build(entity: Entity) {
    const spec: Model3 = entity.get(Model3);
    const loaded: ModelAssetLoaded = entity.get(ModelAssetLoaded);

    if (loaded.error) {
      return this.error(entity, loaded.error);
    } else if (!loaded.value) {
      return this.error(entity, `model expects glTF (${entity.id})`);
    }

    let scene;
    if (entity.hasByName("Animation")) {
      // Must clone scene when it includes animations
      scene = firstTimePrepareScene(
        clone(loaded.value.scene),
        spec.compat,
        entity.name === "Avatar"
      );
    } else {
      scene = this.getScene(
        loaded.value.scene,
        entity.id,
        loaded.cacheKey,
        spec.compat
      );
    }

    entity.add(ModelRef, { value: { ...loaded.value, scene } });

    this.attach(entity);
  }

  remove(entity: Entity) {
    const ref: ModelRef = entity.get(ModelRef);

    if (ref) {
      if (ref.value) {
        this.detach(entity);
      }
      if (ref.errorEntity) {
        ref.errorEntity.destroy();
      }
    }

    entity.maybeRemove(ModelRef);
  }

  attach(entity: Entity) {
    const object3dref: Object3DRef = entity.get(Object3DRef);

    if (object3dref) {
      const object3d = object3dref.value;

      const gltf: GLTF = entity.get(ModelRef).value;
      object3d.add(gltf.scene);

      // Notify dependencies (e.g. colliders) that object3d has changed
      object3dref.modified();
    }
  }

  detach(entity: Entity) {
    const object3dref: Object3DRef = entity.get(Object3DRef);

    if (object3dref) {
      const object3d = object3dref.value;

      const child: GLTF = entity.get(ModelRef).value;
      object3d.remove(child.scene);

      // Notify dependencies (e.g. colliders) that object3d has changed
      object3dref.modified();
    }
  }

  error(entity: Entity, msg: string) {
    const errorEntity = makeError(entity, msg);

    // Empty object
    entity.add(ModelRef, {
      value: {
        scene: new Object3D(),
        animations: [],
      },
      errorEntity,
    });

    this.attach(entity);
  }

  // Use cached GLTF scene if available; otherwise cache fresh scene and return
  getScene(
    scene: Group,
    entityId: EntityId,
    cacheKey: string,
    compatMode: boolean = false
  ) {
    const key = `${entityId}/${cacheKey}/${compatMode ? 1 : 0}`;

    if (!cache.has(key)) {
      cache.set(key, firstTimePrepareScene(scene, compatMode, false));
    }

    return cache.get(key);
  }

  updateOffset(entity: Entity) {
    const spec: Model3 = entity.get(Model3);
    const ref: ModelRef = entity.get(ModelRef);

    ref.value.scene?.position.copy(spec.offset);
  }
}
